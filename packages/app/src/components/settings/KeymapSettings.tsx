import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";
import {
  DEFAULT_BINDINGS,
  type KeymapCategory,
  formatKeyBinding,
  getKeymapByCategory,
} from "@readany/core/reader";
import { cn } from "@readany/core/utils";
import { BookOpen, Command, Compass, ExternalLink, Keyboard, Search, Type, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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

export function KeymapSettings() {
  const { t } = useTranslation();
  const setShowKeymapDialog = useAppStore((s) => s.setShowKeymapDialog);
  const [selectedCategory, setSelectedCategory] = useState<KeymapCategory | "all">("all");
  const [search, setSearch] = useState("");

  const isMac = useMemo(
    () =>
      typeof navigator !== "undefined"
        ? /mac/i.test(navigator.platform || navigator.userAgent)
        : true,
    [],
  );

  const filteredBindings = useMemo(() => {
    let list = DEFAULT_BINDINGS;
    if (selectedCategory !== "all") {
      list = list.filter((b) => (b.category || "general") === selectedCategory);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((b) => {
      const desc = b.description.toLowerCase();
      const act = b.action.toLowerCase();
      const key = b.key.toLowerCase();
      const keys = formatKeyBinding(b, isMac).join(" ").toLowerCase();
      return desc.includes(q) || act.includes(q) || key.includes(q) || keys.includes(q);
    });
  }, [selectedCategory, search, isMac]);

  const categorized = useMemo(() => getKeymapByCategory(filteredBindings), [filteredBindings]);

  const categories: (KeymapCategory | "all")[] = [
    "all",
    "navigation",
    "reading",
    "zoom",
    "general",
  ];
  const displayCategories: KeymapCategory[] =
    selectedCategory === "all" ? ["navigation", "reading", "zoom", "general"] : [selectedCategory];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Title & Quick Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("settings.keymap_title", "Keymap & Shortcuts")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              "settings.keymap_desc",
              "Keyboard shortcuts for navigation, reading, and app controls",
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowKeymapDialog(true)}
          className="self-start sm:self-auto gap-1.5 text-xs"
        >
          <Keyboard className="h-3.5 w-3.5" />
          {t("settings.keymapQuickDialog", "Quick Cheat Sheet")}
          <ExternalLink className="h-3 w-3 opacity-60" />
        </Button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const label =
              cat === "all" ? t("settings.keymapCategoryAll", "All") : t(CATEGORY_KEYS[cat], cat);
            const count =
              cat === "all"
                ? DEFAULT_BINDINGS.length
                : DEFAULT_BINDINGS.filter((b) => (b.category || "general") === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span>{label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("settings.keymapSearchPlaceholder", "Search shortcuts...")}
            className="h-8 pl-8 pr-7 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Shortcuts List */}
      <div className="space-y-6">
        {filteredBindings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-xs text-muted-foreground">
            {t("settings.keymapNoResults", "No shortcuts match your search")}
          </div>
        ) : (
          displayCategories.map((cat) => {
            const items = categorized[cat];
            if (!items || items.length === 0) return null;
            const Icon = CATEGORY_ICONS[cat];
            const categoryLabel = t(CATEGORY_KEYS[cat], cat);

            return (
              <div key={cat} className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span>{categoryLabel}</span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    ({items.length})
                  </span>
                </div>
                <div className="divide-y divide-border/60 rounded-xl border border-border bg-card/60 overflow-hidden shadow-2xs">
                  {items.map((binding, idx) => {
                    const keys = formatKeyBinding(binding, isMac);
                    return (
                      <div
                        key={`${binding.action}-${idx}`}
                        className="flex items-center justify-between px-4 py-2.5 text-xs transition-colors hover:bg-muted/30"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{binding.description}</span>
                          <span className="font-mono text-[10px] text-muted-foreground/70">
                            {binding.action}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {keys.map((k, i) => (
                            <kbd
                              key={i}
                              className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-border bg-muted px-2 font-mono text-xs font-semibold text-foreground shadow-2xs"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
