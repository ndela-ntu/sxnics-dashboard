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

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
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

const ShopItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  price: z.coerce.number().gt(0, { message: "Price should be greater than 0" }),
  image: z
    .instanceof(File)
    .refine((file: File) => file.size !== 0, "Image is required")
    .refine((file: File) => {
      return !file || file.size <= 1024 * 1024 * 5;
    }, "File size must be less than 5MB"),
  quantity: z.coerce
    .number()
    .gt(-1, { message: "Quantity should be greater than -1" }),
});

export type ShopItemState = {
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    image?: string[];
    quantity?: string[];
  };
  message?: string | null;
};

const CreateShopItemSchema = ShopItemSchema.omit({ id: true });
export async function createShopItem(
  prevState: ShopItemState,
  formData: FormData
) {
  const validatedFields = CreateShopItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    image: formData.get("image"),
    quantity: formData.get("quantity"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  const supabase = createClient();

  try {
    const { name, price, description, image, quantity } = validatedFields.data;

    // 1. Upload image to Supabase Storage
    const { data: imageData, error: imageError } = await supabase.storage
      .from("sxnics/shop_items")
      .upload(`${Date.now()}-${image.name}`, image);

    if (imageError) {
      throw new Error(`Failed to upload image: ${imageError.message}`);
    }

    // Get the public URL of the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("sxnics/shop_items").getPublicUrl(imageData.path);

    // 2. Store item details in Supabase table
    const { data, error } = await supabase
      .from("shop_items")
      .insert({
        name,
        description,
        price,
        quantity,
        imageUrl: publicUrl,
      })
      .select();

    if (error) {
      throw new Error(`Failed to insert item: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in createClothingItem:", error);
    return { error };
  }

  revalidatePath("/dashboard/shop");
  redirect("/dashboard/shop");
}

const EditShopItemSchema = ShopItemSchema.omit({ image: true });
export async function editShopItem(
  prevState: ShopItemState,
  formData: FormData
) {
  const validatedFields = EditShopItemSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
  });
  const imageFile = formData.get("image") as File | null;

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  const supabase = createClient();

  const { id, name, price, description, quantity } = validatedFields.data;

  try {
    let imageUrl = formData.get("currentImageUrl") as string;

    if (imageFile && imageFile.size > 0) {
      // Delete the old image if it exists
      if (imageUrl) {
        const oldImagePath = imageUrl.split("/").pop();

        if (oldImagePath) {
          await supabase.storage
            .from("sxnics")
            .remove([`shop_items/${oldImagePath}`]);
        } else {
          throw new Error("Unable to resolve oldImagePath");
        }
      }

      // Upload the new image

      const { data: imageData, error: imageError } = await supabase.storage
        .from("sxnics")
        .upload(`shop_items/${Date.now()}-${imageFile.name}`, imageFile);

      if (imageError) {
        throw new Error(`Failed to upload image: ${imageError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("sxnics").getPublicUrl(`${imageData.path}`);

      imageUrl = publicUrl;
    }

    const { data, error } = await supabase
      .from("shop_items")
      .update({
        name,
        description,
        price,
        quantity,
        imageUrl,
      })
      .eq("id", parseInt(id))
      .select();

    if (error) {
      throw new Error(`Failed to update item: ${error.message}`);
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
    // Fetch the item to get the image URL
    const { data: item, error: fetchError } = await supabase
      .from("shop_items")
      .select("imageUrl")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch item: ${fetchError.message}`);
    }

    // Delete the image from storage if it exists
    if (item?.imageUrl) {
      const imagePath = item.imageUrl.split("/").pop();
      const { error: storageError } = await supabase.storage
        .from("sxnics")
        .remove([`shop_items/${imagePath}`]);

      if (storageError) {
        console.error(`Failed to delete image: ${storageError.message}`);
        // Continue with item deletion even if image deletion fails
      }
    }

    // Delete the item from the database
    const { error: deleteError } = await supabase
      .from("shop_items")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete item: ${deleteError.message}`);
    }
  } catch (error) {
    console.error("Error in deleteClothingItem:", error);
    return { error };
  }

  revalidatePath("/dashboard/shop");
}

const EpisodeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  artist: z.string().min(1, { message: "Artist is required" }),
  description: z
    .string()
    .min(15, { message: "Description needs to be 15+ characters" }),
  image: z
    .instanceof(File)
    .refine((file: File) => file.size !== 0, "Image is required")
    .refine((file: File) => {
      return !file || file.size <= 1024 * 1024 * 5;
    }, "File size must be less than 5MB"),
  audio: z
    .instanceof(File)
    .refine((file: File) => file.size !== 0, "Image is required")
    .refine((file: File) => {
      return !file || file.size <= 1024 * 1024 * 200;
    }, "File size must be less than 200MB"),
});

export type EpisodeState = {
  errors?: {
    name?: string[];
    artist?: string[];
    description?: string[];
    image?: string[];
    audio?: string[];
  };
  message?: string | null;
};

const CreateEpisodeSchema = EpisodeSchema.omit({ id: true });
export async function createEpisode(
  prevState: ShopItemState,
  formData: FormData
) {
  const validatedFields = CreateEpisodeSchema.safeParse({
    name: formData.get("name"),
    artist: formData.get("artist"),
    description: formData.get("description"),
    image: formData.get("image"),
    audio: formData.get("audio"),
  });

  if (!validatedFields.success) {
    return <EpisodeState>{
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missed fields, failed to create item.",
    };
  }

  const supabase = createClient();

  try {
    const { name, artist, description, image, audio } = validatedFields.data;

    // 1. Upload image to Supabase Storage
    const { data: imageData, error: imageError } = await supabase.storage
      .from("sxnics")
      .upload(`episodes/${Date.now()}-${image.name}`, image);

    if (imageError) {
      throw new Error(`Failed to upload image: ${imageError.message}`);
    }

    // Get the public URL of the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("sxnics").getPublicUrl(imageData.path);

    const fileName = `${uuidv4()}_${audio.name}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: fileName,
      Body: Buffer.from(await audio.arrayBuffer()),
      ContentType: audio.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // 2. Store item details in Supabase table
    const { data, error } = await supabase
      .from("episodes")
      .insert({
        name,
        artist,
        description,
        imageUrl: publicUrl,
        audioUrl: s3Url,
      })
      .select();

    if (error) {
      throw new Error(`Failed to insert episode: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in createEpisode:", error);
    return <EpisodeState>{ error: {}, message: "Error from server" };
  }

  revalidatePath("/dashboard/episodes");
  redirect("/dashboard/episodes");
}

const EditEpisodeSchema = EpisodeSchema.omit({ audio: true, image: true });
export async function editEpisode(
  prevState: ShopItemState,
  formData: FormData
) {
  const validatedFields = EditEpisodeSchema.safeParse({
    id: formData.get("id"),
    artist: formData.get("artist"),
    description: formData.get("description"),
    name: formData.get("name"),
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
    const { id, name, artist, description } = validatedFields.data;

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
        artist,
        description,
        imageUrl,
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

export async function deleteEpisode(id: number) {
  const supabase = createClient();

  try {
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

    if (episode.audioUrl) {
      const url = new URL(episode.audioUrl);
      const bucketName = url.hostname.split(".")[0];
      const objectKey = decodeURIComponent(url.pathname.substring(1));

      const params = {
        Bucket: bucketName,
        Key: objectKey,
      };

      const command = new DeleteObjectCommand(params);
      await s3Client.send(command);
    }

    const { error: deleteError } = await supabase
      .from("episodes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete item: ${deleteError.message}`);
    }
  } catch (error) {
    console.error("Error in editEpisode:", error);
    return { error };
  }

  revalidatePath("/dashboard/episodes");
}
