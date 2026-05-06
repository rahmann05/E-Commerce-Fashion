import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

router.post("/", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, error: "Supabase is not configured" });
    }

    const { bucket, path, base64, contentType } = req.body as {
      bucket?: string;
      path?: string;
      base64?: string;
      contentType?: string;
    };

    if (!bucket || !path || !base64) {
      return res.status(400).json({ success: false, error: "Missing upload payload" });
    }

    const normalized = base64.includes("base64,")
      ? base64.split("base64,")[1]
      : base64;
    const buffer = Buffer.from(normalized, "base64");

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: contentType || "application/octet-stream",
        upsert: true
      });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return res.json({ success: true, publicUrl: data.publicUrl, path });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
