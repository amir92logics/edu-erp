"use client";

import { useState, useTransition } from "react";
import {
    Building2,
    CreditCard,
    Zap,
    MessageSquare,
    ShieldCheck,
    Save,
    Mail,
    Phone as PhoneIcon,
    MapPin,
    Loader2,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Lock,
} from "lucide-react";
import {
    updateSchoolProfile,
    updateMerchantCredentials,
    changePassword,
} from "@/app/actions/settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ── Types ───────────────────────────────────────────────────────────────────────

type Settings = {
    id: string;
    name: string;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
    jazzCashMerchantId: string | null;
    jazzCashPassword: string | null;
    jazzCashSalt: string | null;
    easypaisaMerchantId: string | null;
    easypaisaHashKey: string | null;
    subscriptionPlan: string;
    status: string;
    trialEndsAt: Date | null;
    isWhatsAppApproved: boolean;
};

const TABS = [
    { id: "profile", label: "Profile", icon: Building2 },
    { id: "payment", label: "Payment Gateway", icon: CreditCard },
    { id: "subscription", label: "Subscription", icon: Zap },
    { id: "whatsapp", label: "WhatsApp Settings", icon: MessageSquare },
    { id: "security", label: "Security", icon: ShieldCheck },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Reusable form field components ────────────────────────────────────────────

function FieldGroup({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                {label}
            </label>
            {children}
            {error && (
                <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium px-1">
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}
        </div>
    );
}

function FormInput({
    icon: Icon,
    error,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: any;
    error?: boolean;
}) {
    return (
        <div className="relative">
            {Icon && (
                <Icon
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                />
            )}
            <input
                {...props}
                className={`w-full ${Icon ? "pl-12" : "pl-5"} pr-5 py-3 bg-slate-50 border-2 rounded-xl outline-none transition-all font-medium text-slate-700 ${error
                    ? "border-red-300 focus:border-red-500 focus:bg-white"
                    : "border-transparent focus:border-blue-600 focus:bg-white"
                    }`}
            />
        </div>
    );
}

function SaveButton({ loading }: { loading: boolean }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm shadow-blue-100"
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
        </button>
    );
}

// ── Tab: Profile ──────────────────────────────────────────────────────────────

function ProfileTab({ settings }: { settings: Settings }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);

        try {
            const result = await updateSchoolProfile({
                name: fd.get("name") as string,
                contactEmail: fd.get("contactEmail") as string,
                contactPhone: fd.get("contactPhone") as string,
                address: fd.get("address") as string,
            });
            if (result.success) {
                toast.success("Institution profile updated.");
                router.refresh();
            }
        } catch {
            toast.error("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <FieldGroup label="Institution Name">
                        <FormInput
                            name="name"
                            required
                            defaultValue={settings.name}
                            placeholder="e.g. City High School"
                        />
                    </FieldGroup>
                </div>

                <FieldGroup label="Public Email">
                    <FormInput
                        name="contactEmail"
                        type="email"
                        icon={Mail}
                        defaultValue={settings.contactEmail || ""}
                        placeholder="admin@school.com"
                    />
                </FieldGroup>

                <FieldGroup label="Phone Number">
                    <FormInput
                        name="contactPhone"
                        icon={PhoneIcon}
                        defaultValue={settings.contactPhone || ""}
                        placeholder="03001234567"
                    />
                </FieldGroup>

                <div className="md:col-span-2">
                    <FieldGroup label="Postal Address">
                        <div className="relative">
                            <MapPin
                                className="absolute left-4 top-3.5 text-slate-400"
                                size={18}
                            />
                            <textarea
                                name="address"
                                rows={3}
                                defaultValue={settings.address || ""}
                                placeholder="Street, City, Province"
                                className="w-full pl-12 pr-5 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none font-medium text-slate-700 resize-none transition-all"
                            />
                        </div>
                    </FieldGroup>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <SaveButton loading={loading} />
            </div>
        </form>
    );
}

// ── Tab: Payment Gateway ──────────────────────────────────────────────────────

function PaymentTab({ settings }: { settings: Settings }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);

        try {
            const result = await updateMerchantCredentials({
                jazzCashMerchantId: fd.get("jazzCashMerchantId") as string,
                jazzCashSalt: fd.get("jazzCashSalt") as string,
            });
            if (result.success) {
                toast.success("Payment gateway credentials updated.");
                router.refresh();
            }
        } catch {
            toast.error("Failed to update credentials.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* JazzCash */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-red-600 font-black text-sm">
                        JC
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">JazzCash Merchant</h3>
                        <p className="text-xs text-slate-400">
                            Active payment integration
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldGroup label="Merchant ID">
                        <FormInput
                            name="jazzCashMerchantId"
                            type="password"
                            defaultValue={settings.jazzCashMerchantId || ""}
                            placeholder="Enter merchant ID"
                        />
                    </FieldGroup>
                    <FieldGroup label="Secret Salt">
                        <FormInput
                            name="jazzCashSalt"
                            type="password"
                            defaultValue={settings.jazzCashSalt || ""}
                            placeholder="Enter secret salt"
                        />
                    </FieldGroup>
                </div>
            </div>

            {/* Easypaisa — read-only/coming soon */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 opacity-60">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600 font-black text-sm">
                            EP
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">
                                Easypaisa Merchant
                            </h3>
                            <p className="text-xs text-slate-400 italic">
                                Integration under deployment
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 uppercase tracking-widest">
                        Coming Soon
                    </span>
                </div>
            </div>

            <div className="flex justify-end">
                <SaveButton loading={loading} />
            </div>
        </form>
    );
}

// ── Tab: Subscription ─────────────────────────────────────────────────────────

function SubscriptionTab({ settings }: { settings: Settings }) {
    const planBadge: Record<string, string> = {
        BASIC: "bg-slate-100 text-slate-700",
        PRO: "bg-blue-50 text-blue-700",
        ENTERPRISE: "bg-purple-50 text-purple-700",
    };

    const statusBadge: Record<string, string> = {
        ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
        TRIAL: "bg-amber-50 text-amber-700 border-amber-100",
        SUSPENDED: "bg-red-50 text-red-700 border-red-100",
        INACTIVE: "bg-slate-50 text-slate-500 border-slate-100",
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        Current Plan
                    </p>
                    <span
                        className={`inline-block px-4 py-1.5 rounded-full text-sm font-black ${planBadge[settings.subscriptionPlan] ?? planBadge.BASIC
                            }`}
                    >
                        {settings.subscriptionPlan} Edition
                    </span>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        Account Status
                    </p>
                    <span
                        className={`inline-block px-4 py-1.5 rounded-full text-sm font-black border ${statusBadge[settings.status] ?? statusBadge.INACTIVE
                            }`}
                    >
                        {settings.status}
                    </span>
                </div>

                {settings.trialEndsAt && (
                    <div className="md:col-span-2 p-6 rounded-2xl border border-amber-200 bg-amber-50">
                        <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">
                            Trial Period
                        </p>
                        <p className="font-bold text-amber-800">
                            Trial ends on{" "}
                            {new Date(settings.trialEndsAt).toLocaleDateString("en-PK", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                        <p className="text-sm text-amber-600 mt-1">
                            Contact your platform administrator to upgrade or extend.
                        </p>
                    </div>
                )}
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white">
                <p className="text-sm text-slate-500 leading-relaxed">
                    Subscription and plan changes are managed by the platform
                    administrator. Please contact{" "}
                    <strong className="text-slate-700">support</strong> for plan
                    upgrades, renewals, or cancellation requests.
                </p>
            </div>
        </div>
    );
}

// ── Tab: WhatsApp Settings ─────────────────────────────────────────────────────

function WhatsAppTab({ settings }: { settings: Settings }) {
    return (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900">
                            WhatsApp Gateway Status
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Approval for WhatsApp messaging is managed by the platform
                            administrator.
                        </p>
                    </div>
                    <span
                        className={`px-4 py-1.5 rounded-full text-sm font-black border ${settings.isWhatsAppApproved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                    >
                        {settings.isWhatsAppApproved ? "Approved" : "Pending Approval"}
                    </span>
                </div>
            </div>

            {settings.isWhatsAppApproved && (
                <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={20} />
                        <div>
                            <p className="font-bold text-emerald-800">Gateway Active</p>
                            <p className="text-sm text-emerald-600 mt-0.5">
                                Your school is authorised to send WhatsApp notifications. Use
                                the{" "}
                                <a
                                    href="/admin/whatsapp"
                                    className="underline font-semibold"
                                >
                                    WhatsApp page
                                </a>{" "}
                                to manage your session.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 rounded-2xl border border-slate-200 bg-white">
                <p className="text-sm text-slate-500 leading-relaxed">
                    To request WhatsApp gateway access or increase your monthly message
                    quota, contact the platform administrator.
                </p>
            </div>
        </div>
    );
}

// ── Tab: Security ─────────────────────────────────────────────────────────────

function SecurityTab() {
    const [loading, startTransition] = useTransition();
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const fd = new FormData(e.currentTarget);
        const data = {
            currentPassword: fd.get("currentPassword") as string,
            newPassword: fd.get("newPassword") as string,
            confirmPassword: fd.get("confirmPassword") as string,
        };

        startTransition(async () => {
            const result = await changePassword(data);
            if (result.success) {
                setSuccess(true);
                (e.target as HTMLFormElement).reset();
            } else {
                setError(result.error ?? "An error occurred.");
            }
        });
    }

    function PasswordField({
        name,
        label,
        show,
        onToggle,
    }: {
        name: string;
        label: string;
        show: boolean;
        onToggle: () => void;
    }) {
        return (
            <FieldGroup label={label}>
                <div className="relative">
                    <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <input
                        required
                        name={name}
                        type={show ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none font-medium text-slate-700 transition-all"
                    />
                    <button
                        type="button"
                        onClick={onToggle}
                        tabIndex={-1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </FieldGroup>
        );
    }

    return (
        <div className="max-w-lg space-y-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
                <h3 className="font-bold text-slate-900 mb-1">Change Password</h3>
                <p className="text-sm text-slate-500">
                    Choose a strong password of at least 6 characters.
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
                    <CheckCircle2 size={16} />
                    Password changed successfully.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <PasswordField
                    name="currentPassword"
                    label="Current Password"
                    show={showCurrent}
                    onToggle={() => setShowCurrent((v) => !v)}
                />
                <PasswordField
                    name="newPassword"
                    label="New Password"
                    show={showNew}
                    onToggle={() => setShowNew((v) => !v)}
                />
                <PasswordField
                    name="confirmPassword"
                    label="Confirm New Password"
                    show={showConfirm}
                    onToggle={() => setShowConfirm((v) => !v)}
                />

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm shadow-blue-100"
                    >
                        {loading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Lock size={14} />
                        )}
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
}

// ── Root SettingsTabs component ───────────────────────────────────────────────

export function SettingsTabs({ settings }: { settings: Settings }) {
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    const tabContent: Record<TabId, React.ReactNode> = {
        profile: <ProfileTab settings={settings} />,
        payment: <PaymentTab settings={settings} />,
        subscription: <SubscriptionTab settings={settings} />,
        whatsapp: <WhatsAppTab settings={settings} />,
        security: <SecurityTab />,
    };

    return (
        <div className="space-y-0">
            {/* Tab bar */}
            <div className="flex border-b border-slate-200 overflow-x-auto">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === id
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200"
                            }`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="pt-8">{tabContent[activeTab]}</div>
        </div>
    );
}
