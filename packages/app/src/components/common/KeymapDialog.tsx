import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_BINDINGS,
  type KeyBinding,
  type KeymapCategory,
  formatKeyBinding,
  getKeymapByCategory,
} from "@readany/core/reader";
import { BookOpen, Command, Compass, Search, Sparkles, Type, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface KeymapDialogProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<KeymapCategory, typeof Compass> = {
  navigation: Compass,
  reading: BookOpen,
  zoom: Type,
  general: Command,
};

const CATEGORY_KEYS: Record<KeymapCategory, string> = {
  navigation: "settings.keymapCategoryNavigation",
  reading: "settings.keymapCategoryReading",
  zoom: "settings.keymapCategoryZoom",
  general: "settings.keymapCategoryGeneral",
};

export function KeymapDialog({ open, onClose }: KeymapDialogProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const isMac = useMemo(
    () =>
      typeof navigator !== "undefined"
        ? /mac/i.test(navigator.platform || navigator.userAgent)
        : true,
    [],
  );

  const filteredBindings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEFAULT_BINDINGS;
    return DEFAULT_BINDINGS.filter((b) => {
      const desc = b.description.toLowerCase();
      const act = b.action.toLowerCase();
      const key = b.key.toLowerCase();
      const keys = formatKeyBinding(b, isMac).join(" ").toLowerCase();
      return desc.includes(q) || act.includes(q) || key.includes(q) || keys.includes(q);
    });
  }, [query, isMac]);

  const categorized = useMemo(() => getKeymapByCategory(filteredBindings), [filteredBindings]);

  const categoryOrder: KeymapCategory[] = ["navigation", "reading", "zoom", "general"];
  const hasResults = filteredBindings.length > 0;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="flex max-h-[85vh] w-[90vw] max-w-[720px] flex-col overflow-hidden p-0 sm:max-h-[80vh]">
        {/* Header with Title and Search */}
        <DialogHeader className="flex-shrink-0 border-b border-border p-4 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              {t("settings.keymap_title", "Keymap & Shortcuts")}
            </DialogTitle>
          </div>
          <div className="relative mt-2.5">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("settings.keymapSearchPlaceholder", "Search shortcuts...")}
              className="h-8 pl-8 pr-7 text-xs"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {!hasResults ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              {t("settings.keymapNoResults", "No shortcuts match your search")}
            </div>
          ) : (
            categoryOrder.map((cat) => {
              const items = categorized[cat];
              if (!items || items.length === 0) return null;
              const Icon = CATEGORY_ICONS[cat];
              const categoryLabel = t(CATEGORY_KEYS[cat], cat);

              return (
                <div key={cat} className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{categoryLabel}</span>
                    <span className="text-[10px] text-muted-foreground/60">({items.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {items.map((binding, idx) => (
                      <ShortcutRow
                        key={`${binding.action}-${idx}`}
                        binding={binding}
                        isMac={isMac}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
          <span>{t("settings.keymapQuickDialogDesc", "Press ? or ⌘/ anywhere to toggle")}</span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
            Esc
          </kbd>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutRow({ binding, isMac }: { binding: KeyBinding; isMac: boolean }) {
  const keys = formatKeyBinding(binding, isMac);

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-card/60 px-3 py-2 text-xs transition-colors hover:bg-muted/40">
      <span className="truncate text-foreground/90">{binding.description}</span>
      <div className="flex flex-shrink-0 items-center gap-1">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[11px] font-semibold text-foreground shadow-2xs"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}
