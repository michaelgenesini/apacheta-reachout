-- Add form color customisation columns.
-- form_primary_color: button + accent color on the public form (default: teal)
-- form_bg_color:      background color of the public form (default: cream)

alter table public.profiles
  add column form_primary_color text not null default '#0c7b5f',
  add column form_bg_color      text not null default '#fffcf1';

-- Validate basic hex color format (#rgb or #rrggbb)
alter table public.profiles
  add constraint form_primary_color_hex
    check (form_primary_color ~ '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$'),
  add constraint form_bg_color_hex
    check (form_bg_color ~ '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$');
