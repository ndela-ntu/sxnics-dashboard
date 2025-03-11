"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { Truculenta } from "next/font/google";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect("error", "/reset-password", "Passwords do not match");
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect("error", "/reset-password", "Password update failed");
  }

  encodedRedirect("success", "/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
// Helper function to validate Supabase public URLs
const isValidSupabaseUrl = (url: string): boolean => {
  const supabaseUrlPattern =
    /^https:\/\/[^\/]+\/storage\/v1\/object\/public\/.+/;
  return supabaseUrlPattern.test(url);
};

// Schema for the color variant
const colorVariantSchema = z.object({
  id: z.string().optional(), // Optional for creation, required for editing
  checked: z.boolean(),
  image: z
    .union([
      z.instanceof(File).refine(
        (file) => file.size > 0, // Ensure the file is not empty
        { message: "Image file must not be empty." }
      ),
      z.string().refine(
        (url) => isValidSupabaseUrl(url), // Ensure the URL is a valid Supabase public URL
        { message: "Invalid Supabase public URL." }
      ),
    ])
    .optional(), // Make the image optional
  quantities: z
    .record(z.string(), z.number().min(0))
    .refine(
      (quantities) => Object.values(quantities).every((qty) => qty >= 0),
      {
        message: "All quantities must be non-negative.",
      }
    ),
});

// Schema for the inventory form
const inventoryFormSchema = z
  .object({
    colors: z.record(z.string(), colorVariantSchema),
  })
  .refine(
    (data) => {
      // Ensure at least one color is checked
      return Object.values(data.colors).some((color) => color.checked);
    },
    {
      message: "At least one color must be selected.",
      path: ["colors"],
    }
  )
  .refine(
    (data) => {
      // Ensure all checked colors have valid quantities and images
      return Object.entries(data.colors).every(([colorName, colorData]) => {
        if (!colorData.checked) return true; // Skip unchecked colors
        return (
          Object.values(colorData.quantities).every((qty) => qty >= 0) &&
          colorData.image !== undefined && // Ensure image exists for checked colors
          (typeof colorData.image === "string" || colorData.image.size > 0) // Ensure image is valid
        );
      });
    },
    {
      message: "All quantities and images for checked colors must be filled.",
      path: ["colors"],
    }
  );

export type InventoryFormData = z.infer<typeof inventoryFormSchema>;

export async function parseFormData(
  formData: FormData,
  colors: { name: string }[],
  sizes: { name: string }[],
  hasSizes: boolean
) {
  const parsedData = {
    colors: colors.reduce(
      (acc, color) => {
        const checked = formData.get(`checked_${color.name}`) === "on";
        const imageFile = formData.get(`image_${color.name}`);

        // Handle image: it can be a File or a valid Supabase URL
        let image: File | string | undefined;
        if (imageFile instanceof File && imageFile.size > 0) {
          image = imageFile; // It's a valid File
        } else if (
          typeof imageFile === "string" &&
          isValidSupabaseUrl(imageFile)
        ) {
          image = imageFile; // It's a valid Supabase URL
        } else {
          image = undefined; // Invalid or missing image
        }

        const quantities = hasSizes
          ? sizes
              .filter((size) => size.name !== "default")
              .reduce(
                (sizeAcc, size) => {
                  const quantityValue = formData.get(
                    `quantity_${color.name}_${size.name}`
                  );
                  const quantity = quantityValue
                    ? parseInt(quantityValue as string)
                    : 0;

                  if (isNaN(quantity)) {
                    throw new Error(
                      `Invalid quantity value for color ${color.name} and size ${size.name}`
                    );
                  }

                  return {
                    ...sizeAcc,
                    [size.name]: quantity,
                  };
                },
                {} as Record<string, number>
              )
          : (() => {
              const defaultQuantity =
                parseInt(formData.get(`quantity_${color.name}`) as string) || 0;
              if (isNaN(defaultQuantity)) {
                throw new Error(
                  `Invalid quantity value for color ${color.name}`
                );
              }
              return { default: defaultQuantity };
            })();

        return {
          ...acc,
          [color.name]: {
            checked,
            ...(image && { image }), // Only include image if it exists and is valid
            quantities,
          },
        };
      },
      {} as Record<
        string,
        {
          checked: boolean;
          image?: File | string; // Allow image to be File or string (URL)
          quantities: Record<string, number>;
        }
      >
    ),
  };

  try {
    return await inventoryFormSchema.safeParse(parsedData);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Form validation failed: ${error.message}`);
    }
    throw new Error("Form validation failed: Unknown error");
  }
}

const ShopItemSchema = z.object({
  item_type_id: z.coerce.number().gt(0, { message: "Type id is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  price: z.coerce.number().gt(0, { message: "Price should be greater than 0" }),
});

export type ShopItemState = {
  errors?: {
    item_type_id?: string[];
    name?: string[];
    description?: string[];
    price?: string[];
    colors?: string[];
  };
  message?: string | null;
};

export async function createShopItem(
  prevState: ShopItemState,
  formData: FormData
) {
  const validatedFields = ShopItemSchema.safeParse({
    item_type_id: parseInt(formData.get("item_type_id") as string),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
  });

  const supabase = createClient();

  const { data: colors } = await supabase.from("color").select("*");
  const { data: sizes } = await supabase.from("size").select("*");
  const { data: itemTypes } = await supabase.from("shop_item_type").select("*");

  if (!colors || !sizes || !itemTypes)
    throw new Error("Failed to fetch colors or sizes.");

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  try {
    const { item_type_id, name, price, description } = validatedFields.data;

    const hasSizes =
      itemTypes?.find((itemType) => itemType.id === item_type_id)?.has_sizes ??
      false;

    const validatedInventoryFields = await parseFormData(
      formData,
      colors,
      sizes,
      hasSizes
    );

    if (!validatedInventoryFields.success) {
      console.error(validatedInventoryFields.error.flatten().fieldErrors);
      return {
        errors: validatedInventoryFields.error.flatten().fieldErrors,
        message: "Missed fields, failed to create item",
      };
    }

    const { colors: validatedColors } = validatedInventoryFields.data;

    const { data: shopItem, error } = await supabase
      .from("shop_items")
      .insert({
        name,
        description,
        price,
        item_type_id,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to insert shop item:${error.message}`);
    }

    for (const [colorName, colorData] of Object.entries(validatedColors)) {
      if (colorData.checked) {
        if (!colorData.image) {
          throw new Error(`Image required for color ${colorName}`);
        }

        let imagePath;
        let publicUrl: string = "";
        if (colorData.image && colorData.image instanceof File) {
          imagePath = `shop_items/${shopItem.id}/colors/${colorName}/${colorData.image.name}`;
          const { error: uploadError, data: uploadData } =
            await supabase.storage
              .from("sxnics")
              .upload(imagePath, colorData.image, { upsert: true });

          if (uploadError) {
            throw new Error(
              `Failed to upload image for ${colorName}: ${uploadError.message}`
            );
          }

          const {
            data: { publicUrl: url },
          } = supabase.storage.from("sxnics").getPublicUrl(imagePath);

          publicUrl = url;
        }

        const color = colors.find((c) => c.name === colorName);
        if (!color) {
          throw new Error(`Color ${colorName} not found in colors list`);
        }
        const variantRecords = Object.entries(colorData.quantities).map(
          ([sizeName, quantity]) => {
            const size = sizes.find((s) => s.name === sizeName);
            if (!size) {
              throw new Error(`Size ${sizeName} not found in sizes list`);
            }

            return {
              shop_item_id: shopItem.id,
              color_id: color.id,
              size_id: size.id,
              quantity: quantity,
              image_url: publicUrl,
            };
          }
        );

        const { error: variantError } = await supabase
          .from("shop_item_variant")
          .insert(variantRecords);

        if (variantError) {
          throw new Error(
            `Failed to create variants for ${colorName}: ${variantError.message}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error in createClothingItem:", error);
    return { error };
  }

  revalidatePath("/dashboard/shop");
  redirect("/dashboard/shop");
}

export async function editShopItem(
  prevState: ShopItemState,
  formData: FormData
) {
  const validatedFields = ShopItemSchema.safeParse({
    item_type_id: parseInt(formData.get("item_type_id") as string),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
  });
  const itemTypeChanged =
    (formData.get("itemTypeChanged") as string) === "true";
  let shop_item_id = formData.get("shop_item_id") as string;
  const uncheckedColorsIds = formData.get("uncheckedColorsIds") as string;
  let uncheckedIds: { uncheckedColorsIds: number[] } = {
    uncheckedColorsIds: [],
  };

  if (uncheckedColorsIds && uncheckedColorsIds.trim() !== "") {
    try {
      uncheckedIds = JSON.parse(uncheckedColorsIds) as {
        uncheckedColorsIds: number[];
      };
    } catch (error) {
      console.error("Failed to parse uncheckedColorIds:", error);
    }
  }

  const supabase = createClient();

  const { data: colors } = await supabase.from("color").select("*");
  const { data: sizes } = await supabase.from("size").select("*");
  const { data: itemTypes } = await supabase.from("shop_item_type").select("*");

  if (!colors || !sizes || !itemTypes)
    throw new Error("Failed to fetch colors or sizes.");

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);

    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  try {
    //Deal with deletes before anything else
    if (itemTypeChanged) {
      const { data: shopItemVariants, error: variantsError } = await supabase
        .from("shop_item_variant")
        .select("*")
        .eq("shop_item_id", shop_item_id);

      if (variantsError) {
        throw new Error(
          `Error fetching shop item variants:${variantsError.message}`
        );
      }

      const imagesToDeleteUrls: string[] = [];
      shopItemVariants.forEach((variant) => {
        if (!imagesToDeleteUrls.includes(variant.image_url)) {
          imagesToDeleteUrls.push(variant.image_url);
        }
      });

      const deleteImagePromises = imagesToDeleteUrls.map(async (imageUrl) => {
        const filePath = imageUrl
          .split("/object/public/")[1]
          .split("sxnics/")[1];
        const { error: imageDeleteError } = await supabase.storage
          .from("sxnics")
          .remove([filePath]);

        if (imageDeleteError) {
          throw new Error(
            `Error deleting image: ${imageUrl}, ${imageDeleteError.message}`
          );
        }
      });

      const deleteVariantPromises = shopItemVariants.map(async (variant) => {
        const { error: deleteError } = await supabase
          .from("shop_item_variant")
          .delete()
          .eq("id", variant.id);

        if (deleteError) {
          throw new Error(
            `Error deleting variant with id: ${variant.id}, ${deleteError.message}`
          );
        }
      });

      await Promise.all(deleteImagePromises);
      await Promise.all(deleteVariantPromises);

      const { error: shopItemDeleteError } = await supabase
        .from("shop_items")
        .delete()
        .eq("id", shop_item_id);

      if (shopItemDeleteError) {
        throw new Error(
          `Error deleting shop item with id: ${shop_item_id}, ${shopItemDeleteError.message}`
        );
      }
    }

    if (uncheckedIds.uncheckedColorsIds.length > 0) {
      const { data: shopItemVariants, error: variantsError } = await supabase
        .from("shop_item_variant")
        .select("*")
        .eq("shop_item_id", shop_item_id)
        .in("color_id", uncheckedIds.uncheckedColorsIds);

      if (variantsError) {
        throw new Error(
          `Error fetching shop item variants:${variantsError.message}`
        );
      }

      const imagesToDeleteUrls: string[] = [];
      shopItemVariants.forEach((variant) => {
        if (!uncheckedIds.uncheckedColorsIds.includes(variant.color_id)) {
          imagesToDeleteUrls.push(variant.image_url);
        }
      });

      const deleteImagePromises = imagesToDeleteUrls.map(async (imageUrl) => {
        const filePath = imageUrl
          .split("/object/public/")[1]
          .split("sxnics/")[1];
        const { error: imageDeleteError } = await supabase.storage
          .from("sxnics")
          .remove([filePath]);

        if (imageDeleteError) {
          throw new Error(
            `Error deleting image: ${imageUrl}, ${imageDeleteError.message}`
          );
        }
      });

      const deleteVariantPromises = uncheckedIds.uncheckedColorsIds.map(
        async (id) => {
          const { error: deleteError } = await supabase
            .from("shop_item_variant")
            .delete()
            .eq("color_id", id)
            .eq("shop_item_id", shop_item_id);

          if (deleteError) {
            throw new Error(
              `Error deleting shop_item_variant: ${id}, ${deleteError.message}`
            );
          }
        }
      );

      await Promise.all(deleteVariantPromises);
      await Promise.all(deleteImagePromises);
    }

    const { item_type_id, name, price, description } = validatedFields.data;

    const hasSizes =
      itemTypes?.find((itemType) => itemType.id === item_type_id).has_sizes ??
      false;

    const validatedInventoryFields = await parseFormData(
      formData,
      colors,
      sizes,
      hasSizes
    );

    if (!validatedInventoryFields.success) {
      console.error(validatedInventoryFields.error.flatten().fieldErrors);
      return {
        errors: validatedInventoryFields.error.flatten().fieldErrors,
        message: "Missed fields, failed to create item",
      };
    }

    const { colors: validatedColors } = validatedInventoryFields.data;

    if (itemTypeChanged) {
      const { data: shopItem, error: shopItemError } = await supabase
        .from("shop_items")
        .insert({ name, description, price, item_type_id })
        .select("id")
        .single();

      if (shopItemError) {
        throw new Error(`Failed to insert shop item:${shopItemError.message}`);
      }

      shop_item_id = shopItem.id;
    } else {
      const { error: shopItemError } = await supabase
        .from("shop_items")
        .update({
          name,
          description,
          price,
          item_type_id,
        })
        .eq("id", shop_item_id);

      if (shopItemError) {
        throw new Error(`Failed to insert shop item:${shopItemError.message}`);
      }
    }

    for (const [colorName, colorData] of Object.entries(validatedColors)) {
      if (colorData.checked) {
        if (!colorData.image) {
          throw new Error(`Image required for color ${colorName}`);
        }

        let imagePath;
        let publicUrl: string | undefined =
          typeof colorData.image === "string" ? colorData.image : undefined;

        if (publicUrl && colorData.image instanceof File) {
          const filePath = publicUrl.split("/object/public/")[1];
          const { error: imageDeleteError } = await supabase.storage
            .from("sxnics")
            .remove([filePath]);

          if (imageDeleteError) {
            throw new Error(
              `Error deleting image: ${publicUrl}, ${imageDeleteError.message}`
            );
          }
        }

        if (colorData.image && colorData.image instanceof File) {
          imagePath = `shop_items/${shop_item_id}/colors/${colorName}/${colorData.image.name}`;
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("sxnics")
              .upload(imagePath, colorData.image, { upsert: true });

          if (uploadError) {
            throw new Error(
              `Failed to upload image for ${colorName}: ${uploadError.message}`
            );
          }

          const {
            data: { publicUrl: url },
          } = supabase.storage.from("sxnics").getPublicUrl(imagePath);

          publicUrl = url;
        }

        const color = colors.find((c) => c.name === colorName);
        if (!color) {
          throw new Error(`Color ${colorName} not found in colors list`);
        }

        const variantRecords = Object.entries(colorData.quantities).map(
          ([sizeName, quantity]) => {
            const size = sizes.find((s) => s.name === sizeName);
            if (!size) {
              throw new Error(`Size ${sizeName} not found in sizes list`);
            }

            return {
              shop_item_id,
              color_id: color.id,
              size_id: size.id,
              quantity: quantity,
              image_url: publicUrl,
            };
          }
        );

        const variantPromises = variantRecords.map(async (record) => {
          const { data: variant, error: shopItemVariantError } = await supabase
            .from("shop_item_variant")
            .select("*")
            .eq("shop_item_id", record.shop_item_id)
            .eq("color_id", record.color_id)
            .eq("size_id", record.size_id)
            .maybeSingle();

          if (shopItemVariantError) {
            throw new Error(
              `Error fetch shop item variant ${shopItemVariantError.message}`
            );
          }

          if (variant) {
            const { error: updateVariantError } = await supabase
              .from("shop_item_variant")
              .update(record)
              .eq("id", variant.id);

            if (updateVariantError) {
              throw new Error(
                `Error updating shop item variant: ${updateVariantError.message}`
              );
            }
          } else {
            const { error: insertVariantError } = await supabase
              .from("shop_item_variant")
              .insert(record);

            if (insertVariantError) {
              throw new Error(
                `Error inserting shop item variant: ${insertVariantError.message}`
              );
            }
          }
        });

        await Promise.all(variantPromises);
      }
    }
  } catch (error) {
    console.error("Error in editClothingItem:", error);
    return { error };
  }

  revalidatePath("/dashboard/shop");
  redirect("/dashboard/shop");
}

export async function deleteShopItem(id: number) {
  const supabase = createClient();

  try {
    const { data: shopItemVariants, error: variantsError } = await supabase
      .from("shop_item_variant")
      .select("*")
      .eq("shop_item_id", id);

    if (variantsError) {
      throw new Error(
        `Error fetching shop item variants:${variantsError.message}`
      );
    }

    const imagesToDeleteUrls: string[] = [];
    shopItemVariants.forEach((variant) => {
      if (!imagesToDeleteUrls.includes(variant.image_url)) {
        imagesToDeleteUrls.push(variant.image_url);
      }
    });

    const deleteImagePromises = imagesToDeleteUrls.map(async (imageUrl) => {
      const filePath = imageUrl.split("/object/public/")[1].split("sxnics/")[1];
      console.log(filePath);
      const { error: imageDeleteError } = await supabase.storage
        .from("sxnics")
        .remove([filePath]);

      if (imageDeleteError) {
        throw new Error(
          `Error deleting image: ${imageUrl}, ${imageDeleteError.message}`
        );
      }
    });

    const deleteVariantPromises = shopItemVariants.map(async (variant) => {
      const { error: deleteError } = await supabase
        .from("shop_item_variant")
        .delete()
        .eq("id", variant.id);

      if (deleteError) {
        throw new Error(
          `Error deleting variant with id: ${variant.id}, ${deleteError.message}`
        );
      }
    });

    await Promise.all(deleteImagePromises);
    await Promise.all(deleteVariantPromises);

    const { error: shopItemDeleteError } = await supabase
      .from("shop_items")
      .delete()
      .eq("id", id);

    if (shopItemDeleteError) {
      throw new Error(
        `Error deleting shop item with id: ${id}, ${shopItemDeleteError.message}`
      );
    }
  } catch (error) {
    console.error("Error in deleteClothingItem:", error);
    return { error };
  }

  revalidatePath("/dashboard/shop");
}

const EpisodeSchema = z.object({
  id: z.string(),
  tag: z.string().min(1, { message: "Tag is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  artistId: z.number().gt(0),
  description: z
    .string()
    .min(15, { message: "Description needs to be 15+ characters" }),
  image: z
    .instanceof(File)
    .refine((file: File) => file.size !== 0, "Image is required")
    .refine((file: File) => {
      return !file || file.size <= 1024 * 1024 * 5;
    }, "File size must be less than 5MB"),
  contentUrl: z.string().url({ message: "Invalid url provided" }),
});

export type EpisodeState = {
  errors?: {
    name?: string[];
    artistId?: string[];
    description?: string[];
    image?: string[];
    contentUrl?: string[];
    tag?: string[];
  };
  message?: string | null;
};

const CreateEpisodeSchema = EpisodeSchema.omit({ id: true });
export async function createEpisode(
  prevState: EpisodeState,
  formData: FormData
) {
  const validatedFields = CreateEpisodeSchema.safeParse({
    name: formData.get("name"),
    artistId: parseInt(formData.get("artistId") as string),
    description: formData.get("description"),
    image: formData.get("image"),
    contentUrl: formData.get("contentUrl"),
    tag: formData.get("tag"),
  });

  const episodeType = formData.get("episodeType") as string;

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing fields, failed to create item.",
    };
  }

  const supabase = createClient();

  try {
    const { name, artistId, description, image, tag, contentUrl } =
      validatedFields.data;

    if (!(image instanceof File)) {
      throw new Error("Image and audio must be files");
    }

    const { data: imageData, error: imageError } = await supabase.storage
      .from("sxnics")
      .upload(`episodes/${Date.now()}-${image.name}`, image);

    if (imageError) {
      throw new Error(`Failed to upload image: ${imageError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("sxnics").getPublicUrl(imageData.path);

    if (episodeType === "audio") {
      const { data, error } = await supabase
        .from("episodes")
        .insert({
          name,
          artistId,
          description,
          imageUrl: publicUrl,
          audioUrl: contentUrl,
          tag,
        })
        .select();

      if (error) {
        throw new Error(`Failed to insert episode: ${error.message}`);
      }
    } else {
      const { data, error } = await supabase
        .from("video_episodes")
        .insert({
          name,
          artistId,
          description,
          imageUrl: publicUrl,
          videoUrl: contentUrl,
          tag,
        })
        .select();

      if (error) {
        throw new Error(`Failed to insert episode: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("Error in createEpisode:", error);
    return <EpisodeState>{ error: {}, message: "Error from server" };
  }

  revalidatePath("/dashboard/episodes");
  redirect("/dashboard/episodes");
}

const EditEpisodeSchema = EpisodeSchema.omit({ contentUrl: true, image: true });
export async function editEpisode(prevState: EpisodeState, formData: FormData) {
  const validatedFields = EditEpisodeSchema.safeParse({
    id: formData.get("id"),
    artistId: parseInt(formData.get("artistId") as string),
    description: formData.get("description"),
    name: formData.get("name"),
    tag: formData.get("tag"),
  });

  const imageFile = formData.get("image") as File | null;

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  const supabase = createClient();

  try {
    const { id, name, artistId, description, tag } = validatedFields.data;

    let imageUrl = formData.get("currentImageUrl") as string;

    if (imageFile && imageFile.size > 0) {
      if (imageUrl) {
        const oldImagePath = imageUrl.split("/").pop();
        if (oldImagePath) {
          await supabase.storage
            .from("sxnics")
            .remove([`episodes/${oldImagePath}`]);
        } else {
          throw new Error("Unable to resolve oldImagePath");
        }
      }

      const { data: imageData, error: imageError } = await supabase.storage
        .from("sxnics")
        .upload(`episodes/${Date.now()}-${imageFile.name}`, imageFile);

      if (imageError) {
        throw new Error(`Failed to upload image: ${imageError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("sxnics").getPublicUrl(imageData.path);

      imageUrl = publicUrl;
    }

    // 2. Store item details in Supabase table
    const { data, error } = await supabase
      .from("episodes")
      .update({
        name,
        artistId,
        description,
        imageUrl,
        tag,
      })
      .eq("id", parseInt(id))
      .select();

    if (error) {
      throw new Error(`Failed to insert episode: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in editEpisode:", error);
    return { error };
  }

  revalidatePath("/dashboard/episodes");
  redirect("/dashboard/episodes");
}

export async function deleteEpisode(id: number, type: "audio" | "video") {
  const supabase = createClient();

  try {
    if (type === "audio") {
      const { data: episode, error: fetchError } = await supabase
        .from("episodes")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch item: ${fetchError.message}`);
      }

      if (episode.imageUrl) {
        const imagePath = episode.imageUrl.split("/").pop();
        const { error: storageError } = await supabase.storage
          .from("sxnics")
          .remove([`episodes/${imagePath}`]);

        if (storageError) {
          console.error(`Failed to delete image: ${storageError.message}`);
          // Continue with item deletion even if image deletion fails
        }
      }

      //https://sxnics-bucket.s3.eu-west-1.amazonaws.com/15388240-9a03-4496-8ce8-033d38ad8353_bread4soul_2025-01-12T00_32_49-08_00.mp3

      if (episode.audioUrl) {
        const url = new URL(episode.audioUrl);
        const bucketName = url.hostname.split(".")[0];
        const objectKey = decodeURIComponent(url.pathname.substring(1));

        const params = {
          Bucket: bucketName,
          Key: objectKey,
        };

        try {
          const command = new DeleteObjectCommand(params);
          await s3Client.send(command);
        } catch (error) {
          console.error("Failed to delete audio", error);
        }
      }

      const { error: deleteError } = await supabase
        .from("episodes")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error(`Failed to delete item: ${deleteError.message}`);
      }
    } else {
      const { data: videoEpisode, error: fetchError } = await supabase
        .from("video_episodes")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch item: ${fetchError.message}`);
      }

      if (videoEpisode.imageUrl) {
        const imagePath = videoEpisode.imageUrl.split("/").pop();
        const { error: storageError } = await supabase.storage
          .from("sxnics")
          .remove([`episodes/${imagePath}`]);

        if (storageError) {
          console.error(`Failed to delete image: ${storageError.message}`);
        }
      }

      const { error: deleteError } = await supabase
        .from("video_episodes")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error(`Failed to delete item: ${deleteError.message}`);
      }
    }
  } catch (error) {
    console.error("Error in editEpisode:", error);
    return { error };
  }

  revalidatePath("/dashboard/episodes");
}

const ArtistSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  bio: z
    .string()
    .min(10, { message: "Bio needs to be 20 characters and greater." }),
  image: z
    .instanceof(File)
    .refine((file: File) => file.size !== 0, "Image is required")
    .refine((file: File) => {
      return !file || file.size <= 1024 * 1024 * 5;
    }, "File size must be less than 5MB"),
  socialLinks: z.array(
    z.object({ platform: z.string(), url: z.string().url() })
  ),
});

export type ArtistState = {
  errors?: {
    name?: string[];
    bio?: string[];
    image?: string[];
    socialLinks?: string[];
  };
  message?: string | null;
};

const CreateArtistSchema = ArtistSchema.omit({ socialLinks: true, id: true });
export async function createArtist(prevState: ArtistState, formData: FormData) {
  const validatedFields = CreateArtistSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    image: formData.get("image"),
  });

  const socialLinksString = formData.get("socialLinks") as string;

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  const supabase = createClient();

  try {
    const { name, bio, image } = validatedFields.data;

    // 1. Upload image to Supabase Storage
    const { data: imageData, error: imageError } = await supabase.storage
      .from("sxnics")
      .upload(`artists/${Date.now()}-${image.name}`, image);

    if (imageError) {
      throw new Error(`Failed to upload image: ${imageError.message}`);
    }

    // Get the public URL of the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("sxnics").getPublicUrl(imageData.path);

    const socialLinksJson = JSON.parse(socialLinksString);
    const { data, error } = await supabase
      .from("artists")
      .insert({
        name,
        bio,
        imageUrl: publicUrl,
        socialLinks: socialLinksJson,
      })
      .select();

    if (error) {
      throw new Error(`Failed to insert episode: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in createArtist:", error);
    return <EpisodeState>{ error: {}, message: "Error from server" };
  }

  revalidatePath("/dashboard/artists");
  redirect("/dashboard/artists");
}

const EditArtistSchema = ArtistSchema.omit({ socialLinks: true, image: true });
export async function editArtist(prevState: ArtistState, formData: FormData) {
  const validatedFields = EditArtistSchema.safeParse({
    name: formData.get("name"),
    id: formData.get("id"),
    bio: formData.get("bio"),
  });

  const socialLinksString = formData.get("socialLinks") as string;
  const imageFile = formData.get("image") as File | null;

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  const supabase = createClient();

  try {
    const { id, name, bio } = validatedFields.data;

    let imageUrl = formData.get("currentImageUrl") as string;

    if (imageFile && imageFile.size > 0) {
      if (imageUrl) {
        const oldImagePath = imageUrl.split("/").pop();
        if (oldImagePath) {
          await supabase.storage
            .from("sxnics")
            .remove([`artists/${oldImagePath}`]);
        } else {
          throw new Error("Unable to resolve oldImagePath");
        }
      }

      const { data: imageData, error: imageError } = await supabase.storage
        .from("sxnics")
        .upload(`artists/${Date.now()}-${imageFile.name}`, imageFile);

      if (imageError) {
        throw new Error(`Failed to upload image: ${imageError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("sxnics").getPublicUrl(imageData.path);

      imageUrl = publicUrl;
    }

    const socialLinksJson = JSON.parse(socialLinksString);
    // 2. Store item details in Supabase table
    const { data, error } = await supabase
      .from("artists")
      .update({
        name,
        bio,
        imageUrl,
        socialLinks: socialLinksJson,
      })
      .eq("id", parseInt(id))
      .select();

    if (error) {
      throw new Error(`Failed to insert episode: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in editArtist:", error);
    return { error };
  }

  revalidatePath("/dashboard/artists");
  redirect("/dashboard/artists");
}

export async function deleteArtist(id: number) {
  const supabase = createClient();

  try {
    const { data: artist, error: fetchError } = await supabase
      .from("artists")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch item: ${fetchError.message}`);
    }

    if (artist.imageUrl) {
      const imagePath = artist.imageUrl.split("/").pop();
      const { error: storageError } = await supabase.storage
        .from("sxnics")
        .remove([`artists/${imagePath}`]);

      if (storageError) {
        console.error(`Failed to delete image: ${storageError.message}`);
        // Continue with item deletion even if image deletion fails
      }
    }

    const { error: deleteError } = await supabase
      .from("artists")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete item: ${deleteError.message}`);
    }
  } catch (error) {
    console.error("Error in editEpisode:", error);
    return { error };
  }

  revalidatePath("/dashboard/artists");
}

const ReleaseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  artist: z.string().min(1, { message: "Name is required" }),
  about: z
    .string()
    .min(20, { message: "About needs to be 20 characters and greater." }),
  image: z
    .instanceof(File)
    .refine((file: File) => file.size !== 0, "Image is required")
    .refine((file: File) => {
      return !file || file.size <= 1024 * 1024 * 5;
    }, "File size must be less than 5MB"),
  purchaseLink: z.string(),
  type: z.enum(["Vinyl", "Digital", "CD"]),
  tag: z.string(),
});

export type ReleaseState = {
  errors?: {
    name?: string[];
    artist?: string[];
    about?: string[];
    image?: string[];
    purchaseLink?: string[];
    type?: string[];
    tag?: string[];
  };
  message?: string | null;
};

const CreateReleaseSchema = ReleaseSchema.omit({ id: true });
export async function createRelease(
  prevState: ReleaseState,
  formData: FormData
) {
  const validatedFields = CreateReleaseSchema.safeParse({
    name: formData.get("name"),
    artist: formData.get("artist"),
    about: formData.get("about"),
    image: formData.get("image"),
    purchaseLink: formData.get("purchaseLink"),
    type: formData.get("type"),
    tag: formData.get("tag"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  const supabase = createClient();

  try {
    const { name, artist, about, image, purchaseLink, type, tag } =
      validatedFields.data;

    // 1. Upload image to Supabase Storage
    const { data: imageData, error: imageError } = await supabase.storage
      .from("sxnics")
      .upload(`releases/${Date.now()}-${image.name}`, image);

    if (imageError) {
      throw new Error(`Failed to upload image: ${imageError.message}`);
    }

    // Get the public URL of the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("sxnics").getPublicUrl(imageData.path);

    // Calculate the deletion date (7 days from now)
    const deleteAt = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("releases")
      .insert({
        name,
        artist,
        about,
        imageUrl: publicUrl,
        purchaseLink,
        type,
        tag,
        deleteAt,
      })
      .select();

    if (error) {
      throw new Error(`Failed to insert release: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in createRelease:", error);
    return { error: {}, message: "Error from server" };
  }

  revalidatePath("/dashboard/release-radar");
  redirect("/dashboard/release-radar");
}

const EditReleaseSchema = ReleaseSchema.omit({ image: true });
export async function editRelease(prevState: ReleaseState, formData: FormData) {
  const validatedFields = EditReleaseSchema.safeParse({
    name: formData.get("name"),
    id: formData.get("id"),
    artist: formData.get("artist"),
    about: formData.get("about"),
    purchaseLink: formData.get("purchaseLink"),
    type: formData.get("type"),
    tag: formData.get("tag"),
  });

  const imageFile = formData.get("image") as File | null;

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  const supabase = createClient();

  try {
    const { id, name, artist, about, purchaseLink, type, tag } =
      validatedFields.data;

    let imageUrl = formData.get("currentImageUrl") as string;

    if (imageFile && imageFile.size > 0) {
      if (imageUrl) {
        const oldImagePath = imageUrl.split("/").pop();
        if (oldImagePath) {
          await supabase.storage
            .from("sxnics")
            .remove([`releases/${oldImagePath}`]);
        } else {
          throw new Error("Unable to resolve oldImagePath");
        }
      }

      const { data: imageData, error: imageError } = await supabase.storage
        .from("sxnics")
        .upload(`releases/${Date.now()}-${imageFile.name}`, imageFile);

      if (imageError) {
        throw new Error(`Failed to upload image: ${imageError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("sxnics").getPublicUrl(imageData.path);

      imageUrl = publicUrl;
    }

    // 2. Store item details in Supabase table
    const { data, error } = await supabase
      .from("releases")
      .update({
        name,
        artist,
        about,
        imageUrl,
        purchaseLink,
        type,
        tag,
      })
      .eq("id", parseInt(id))
      .select();

    if (error) {
      throw new Error(`Failed to insert episode: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in editArtist:", error);
    return { error };
  }

  revalidatePath("/dashboard/release-radar");
  redirect("/dashboard/release-radar");
}

export async function deleteRelease(id: number) {
  const supabase = createClient();

  try {
    const { data: release, error: fetchError } = await supabase
      .from("releases")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch item: ${fetchError.message}`);
    }

    if (release.imageUrl) {
      const imagePath = release.imageUrl.split("/").pop();
      const { error: storageError } = await supabase.storage
        .from("sxnics")
        .remove([`releases/${imagePath}`]);

      if (storageError) {
        console.error(`Failed to delete image: ${storageError.message}`);
        // Continue with item deletion even if image deletion fails
      }
    }

    const { error: deleteError } = await supabase
      .from("releases")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete item: ${deleteError.message}`);
    }
  } catch (error) {
    console.error("Error in deleteRelease:", error);
    return { error };
  }

  revalidatePath("/dashboard/release-radar");
}

export async function deleteExpiredReleases() {
  const supabase = createClient();

  try {
    // Fetch all releases that are due for deletion
    const { data: expiredReleases, error: fetchError } = await supabase
      .from("releases")
      .select("*")
      .lte("deleteAt", new Date().toISOString());

    if (fetchError) {
      throw new Error(
        `Failed to fetch expired releases: ${fetchError.message}`
      );
    }

    for (const release of expiredReleases) {
      // Delete the associated image
      if (release.imageUrl) {
        const imagePath = release.imageUrl.split("/").pop();
        const { error: storageError } = await supabase.storage
          .from("sxnics")
          .remove([`releases/${imagePath}`]);

        if (storageError) {
          console.error(
            `Failed to delete image for release ${release.id}: ${storageError.message}`
          );
          // Continue with release deletion even if image deletion fails
        }
      }

      // Delete the release
      const { error: deleteError } = await supabase
        .from("releases")
        .delete()
        .eq("id", release.id);

      if (deleteError) {
        console.error(
          `Failed to delete release ${release.id}: ${deleteError.message}`
        );
      } else {
        console.log(`Successfully deleted expired release ${release.id}`);
      }
    }
  } catch (error) {
    console.error("Error in deleteExpiredReleases:", error);
  }
}

const EventSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  about: z.string().min(1, { message: "About is required" }),
  ticketLink: z.string().url({ message: "Invalid url provided" }),
  eventBy: z.string().min(1, { message: "Event by is required" }),
  eventDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Date must be in the future",
  }),
  cover: z
    .instanceof(File)
    .refine((file: File) => file.size !== 0, "Image is required")
    .refine((file: File) => {
      return !file || file.size <= 1024 * 1024 * 5;
    }, "File size must be less than 5MB"),
  sxnicsEventGallery: z.array(
    z
      .instanceof(File)
      .refine((file: File) => file.size !== 0, "Image is required")
      .refine((file: File) => {
        return !file || file.size <= 1024 * 1024 * 5;
      }, "File size must be less than 5MB")
  ),
});

export type EventState = {
  errors?: {
    name?: string[];
    location?: string[];
    about?: string[];
    ticketLink?: string[];
    eventBy?: string[];
    eventDate?: string[];
    cover?: string[];
  };
  message?: string | null;
};

const CreateEventSchema = EventSchema.omit({
  id: true,
  sxnicsEventGallery: true,
});
export async function createEvent(prevState: EventState, formData: FormData) {
  const validatedFields = CreateEventSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    about: formData.get("about"),
    ticketLink: formData.get("ticketLink"),
    eventBy: formData.get("eventBy"),
    eventDate: formData.get("eventDate"),
    cover: formData.get("cover"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  const supabase = createClient();

  try {
    const { name, location, about, ticketLink, eventBy, eventDate, cover } =
      validatedFields.data;

      console.log(eventDate);

    /*const { data: imageData, error: imageError } = await supabase.storage
      .from("sxnics")
      .upload(`events/${Date.now()}-${cover.name}`, cover);

    if (imageError) {
      throw new Error(`Failed to upload image: ${imageError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("sxnics").getPublicUrl(imageData.path);

    const { data, error } = await supabase
      .from("events")
      .insert({
        name,
        location,
        about,
        coverUrl: publicUrl,
        ticketLink,
        eventBy,
        eventDate.toISOString(),
      })
      .select();

    if (error) {
      throw new Error(`Failed to insert episode: ${error.message}`);
    }*/
  } catch (error) {
    console.error("Error in createRelease:", error);
    return <EventState>{ error: {}, message: "Error from server" };
  }

  revalidatePath("/dashboard/event-manager");
  redirect("/dashboard/event-manager");
}

const EditEventSchema = EventSchema.omit({ cover: true });
export async function editTopPick(prevState: EventState, formData: FormData) {
  const validatedFields = EditEventSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    location: formData.get("location"),
    about: formData.get("about"),
    ticketLink: formData.get("ticketLink"),
    eventBy: formData.get("eventBy"),
    eventDate: formData.get("eventDate"),
    sxnicsEventGallery: formData.get('sxnicsEventGallery')
  });

  const imageFile = formData.get("cover") as File | null;

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  const supabase = createClient();

  try {
    const { id, name, location, about, ticketLink, eventBy, eventDate, sxnicsEventGallery } =
      validatedFields.data;

    let imageUrl = formData.get("currentImageUrl") as string;

    if (imageFile && imageFile.size > 0) {
      if (imageUrl) {
        const oldImagePath = imageUrl.split("/").pop();
        if (oldImagePath) {
          await supabase.storage
            .from("sxnics")
            .remove([`top_picks/${oldImagePath}`]);
        } else {
          throw new Error("Unable to resolve oldImagePath");
        }
      }

      const { data: imageData, error: imageError } = await supabase.storage
        .from("sxnics")
        .upload(`top_picks/${Date.now()}-${imageFile.name}`, imageFile);

      if (imageError) {
        throw new Error(`Failed to upload image: ${imageError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("sxnics").getPublicUrl(imageData.path);

      imageUrl = publicUrl;
    }

    // 2. Store item details in Supabase table
    const { data, error } = await supabase
      .from("events")
      .update({
        name,
        location,
        about,
        coverUrl: imageUrl,
        ticketLink,
        eventBy,
        eventDate,
        sxnicsEventGallery,
      })
      .eq("id", parseInt(id))
      .select();

    if (error) {
      throw new Error(`Failed to insert episode: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in editArtist:", error);
    return { error };
  }

  revalidatePath("/dashboard/top-picks");
  redirect("/dashboard/top-picks");
}

export async function deleteTopPick(id: number) {
  const supabase = createClient();

  try {
    const { data: topPick, error: fetchError } = await supabase
      .from("top_picks")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch item: ${fetchError.message}`);
    }

    if (topPick.imageUrl) {
      const imagePath = topPick.imageUrl.split("/").pop();
      const { error: storageError } = await supabase.storage
        .from("sxnics")
        .remove([`top_picks/${imagePath}`]);

      if (storageError) {
        console.error(`Failed to delete image: ${storageError.message}`);
        // Continue with item deletion even if image deletion fails
      }
    }

    const { error: deleteError } = await supabase
      .from("top_picks")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete item: ${deleteError.message}`);
    }
  } catch (error) {
    console.error("Error in deleteTopPick:", error);
    return { error };
  }

  revalidatePath("/dashboard/top-picks");
}

export const approveOrder = async (orderId: number) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("checkout_details") // Replace with your table name
      .update({ status: "APPROVED" }) // Update status to "APPROVED"
      .eq("id", orderId);

    if (error) throw error;
  } catch (error) {
    return { success: false, message: "Failed to approve order." };
  }
  revalidatePath("/orders");
};

// Delete Order Server Action
export const deleteOrder = async (orderId: number) => {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("checkout_details") // Replace with your table name
      .delete()
      .eq("id", orderId);

    if (error) throw error;
  } catch (error) {
    return { success: false, message: "Failed to delete order." };
  }
  revalidatePath("/orders");
};
