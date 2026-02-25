import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Profile } from "@/lib/types";
import { MONTHLY_LIMIT } from "@/lib/types";
import PublicFormClient from "./PublicFormClient";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("form_title")
    .eq("slug", username)   // username param is actually the slug in the URL
    .single();

  if (!profile) return { title: "Form not found" };

  return {
    title: profile.form_title,
    robots: { index: false },
  };
}

export default async function PublicFormPage({ params }: Props) {
  const { username: slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!profile) notFound();

  const p = profile as Profile;

  const bg      = p.form_bg_color      ?? "#fffcf1";
  const primary = p.form_primary_color  ?? "#0c7b5f";

  if (!p.is_live || !p.privacy_url) {
    return (
      <div className="h-screen flex items-center justify-center px-6" style={{ background: bg }}>
        <div className="max-w-sm text-center">
          <h1 className="font-medium mb-2" style={{ fontSize: "20px", color: "#2c2416" }}>{p.form_title}</h1>
          <p style={{ fontSize: "15px", color: "#6b5e4f" }}>This form isn&apos;t available yet.</p>
        </div>
      </div>
    );
  }

  if (p.monthly_submission_count >= MONTHLY_LIMIT) {
    return (
      <div className="h-screen flex items-center justify-center px-6" style={{ background: bg }}>
        <div className="max-w-sm text-center">
          <h1 className="font-medium mb-2" style={{ fontSize: "20px", color: "#2c2416" }}>{p.form_title}</h1>
          <p style={{ fontSize: "15px", color: "#6b5e4f" }}>
            This form has reached its monthly limit. Try again next month.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PublicFormClient
      username={p.slug}
      formTitle={p.form_title}
      introMessage={p.intro_message}
      submitLabel={p.submit_label}
      thankyouMessage={p.thankyou_message}
      privacyUrl={p.privacy_url}
      primaryColor={primary}
      bgColor={bg}
    />
  );
}
