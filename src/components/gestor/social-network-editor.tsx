"use client"

import { SocialNetwork } from "@/types"
import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"

// ─── Inline platform SVG icons ────────────────────────────────────
function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  )
}

function TikTokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 100 12.68 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.77a4.85 4.85 0 01-1.81-.08z" />
    </svg>
  )
}

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  )
}

function YoutubeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.33 2.78 2.78 0 001.95 1.95C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  )
}

function LinkedinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function TwitterIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// ─── Platform config ──────────────────────────────────────────────
type Platform = SocialNetwork["platform"]

export const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; Icon: React.FC<{ size?: number }> }> = {
  instagram: { label: "Instagram", color: "#E1306C", Icon: InstagramIcon },
  tiktok:    { label: "TikTok",    color: "#000000", Icon: TikTokIcon },
  facebook:  { label: "Facebook",  color: "#1877F2", Icon: FacebookIcon },
  youtube:   { label: "YouTube",   color: "#FF0000", Icon: YoutubeIcon },
  linkedin:  { label: "LinkedIn",  color: "#0A66C2", Icon: LinkedinIcon },
  twitter:   { label: "X / Twitter", color: "#1DA1F2", Icon: TwitterIcon },
}

// ─── Component ────────────────────────────────────────────────────
interface SocialNetworkEditorProps {
  value: SocialNetwork[]
  onChange: (networks: SocialNetwork[]) => void
}

export function SocialNetworkEditor({ value, onChange }: SocialNetworkEditorProps) {
  const addedPlatforms = new Set(value.map((n) => n.platform))
  const available = (Object.keys(PLATFORM_CONFIG) as Platform[]).filter((p) => !addedPlatforms.has(p))

  function addNetwork(platform: Platform) {
    onChange([...value, { platform, handle: "" }])
  }

  function updateHandle(index: number, handle: string) {
    const updated = [...value]
    updated[index] = { ...updated[index], handle }
    onChange(updated)
  }

  function removeNetwork(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {/* Existing networks */}
      {value.map((network, i) => {
        const cfg = PLATFORM_CONFIG[network.platform]
        return (
          <div key={network.platform} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white"
              style={{ backgroundColor: cfg.color }}
            >
              <cfg.Icon size={14} />
            </div>
            <span className="text-xs text-slate-500 w-[76px] flex-shrink-0 font-medium">{cfg.label}</span>
            <Input
              value={network.handle}
              onChange={(e) => updateHandle(i, e.target.value)}
              placeholder="@usuario ou URL"
              className="flex-1 text-sm border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50 h-8"
            />
            <button
              type="button"
              onClick={() => removeNetwork(i)}
              className="flex-shrink-0 text-slate-300 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}

      {/* Add buttons for remaining platforms */}
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {available.map((platform) => {
            const cfg = PLATFORM_CONFIG[platform]
            return (
              <button
                key={platform}
                type="button"
                onClick={() => addNetwork(platform)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-colors font-medium"
              >
                <div
                  className="w-4 h-4 rounded-[3px] flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: cfg.color }}
                >
                  <cfg.Icon size={10} />
                </div>
                {cfg.label}
              </button>
            )
          })}
        </div>
      )}

      {value.length === 0 && available.length > 0 && (
        <p className="text-[11px] text-slate-400 italic">Clique numa rede acima para adicionar</p>
      )}
    </div>
  )
}
