import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Save } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { settingsSchema, type SettingsSchemaType } from "../utils/settingsSchema";
import { RatesCard } from "../components/settings/RatesCard";

export default function Settings() {
  const { settings, updateSettings } = useData();
  const { showToast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | undefined>(settings.logoDataUrl);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsSchemaType>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      setValue("logoDataUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: SettingsSchemaType) => {
    updateSettings({ ...values, logoDataUrl: logoPreview });
    showToast("Settings updated successfully");
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-800 dark:text-ivory-100">Settings</h2>
        <p className="text-sm text-ink-400">
          Business information used throughout the app — dashboard, sidebar, and printed booking slips.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-xl border border-ink-100 dark:border-ink-600 flex items-center justify-center overflow-hidden bg-ivory-100 dark:bg-ink-900">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={22} className="text-ink-300" />
                )}
              </div>
              <div>
                <label className="inline-block cursor-pointer rounded-lg border border-ink-100 dark:border-ink-600 px-3 py-1.5 text-sm font-medium text-ink-600 dark:text-ivory-200 hover:bg-ivory-200 dark:hover:bg-ink-600">
                  Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
                <p className="text-xs text-ink-400 mt-1">Used as a placeholder on the printed booking slip.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Banquet Name" error={errors.banquetName?.message} {...register("banquetName")} />
              <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
              <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
              <Input label="City" error={errors.city?.message} {...register("city")} />
            </div>
            <Textarea label="Address" error={errors.address?.message} {...register("address")} />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                <Save size={15} /> Save Settings
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <RatesCard />
    </div>
  );
}
