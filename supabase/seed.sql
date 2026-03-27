begin;

delete from public.lineup_slots;
delete from public.lineup_variants;
delete from public.player_preferences;
delete from public.players;
delete from public.app_settings;

insert into public.players (id, name, shirt_number, card_image_url, player_edit_token)
values
  ('bellgard', 'Bellgard', 1, null, 'ply_bellgard_vfc_u72k91ap3m'),
  ('zake', 'Zake', 2, null, 'ply_zake_vfc_h41n88cl6q'),
  ('murugesan', 'Murugesan', 9, null, 'ply_murugesan_vfc_t33r60xy8b'),
  ('horak', 'Horak', 15, null, 'ply_horak_vfc_m95z27dk4s'),
  ('amini', 'Amini', 8, null, 'ply_amini_vfc_p18x54ne7w'),
  ('rendoth', 'Rendoth', 7, null, 'ply_rendoth_vfc_j62q48lu5c'),
  ('sampera', 'Sampera', 22, null, 'ply_sampera_vfc_r84y16op2n'),
  ('hansen', 'Hansen', 23, null, 'ply_hansen_vfc_k07f93vm1d');

insert into public.player_preferences (
  player_id,
  primary_position,
  secondary_position,
  pace,
  shooting,
  passing,
  dribbling,
  defending,
  physical,
  preferred_x,
  preferred_y,
  coverage_width,
  coverage_depth,
  coverage_bias
)
values
  ('bellgard', 'GK', 'CB', 41, 18, 58, 36, 79, 72, 50, 8, 42, 18, 'center'),
  ('zake', 'RB', 'CB', 72, 45, 66, 64, 76, 74, 77, 36, 28, 34, 'right'),
  ('murugesan', 'ST', 'CAM', 82, 84, 68, 79, 39, 72, 54, 77, 28, 26, 'center'),
  ('horak', 'CB', 'CDM', 60, 41, 64, 57, 83, 81, 50, 27, 32, 30, 'center'),
  ('amini', 'CAM', 'CM', 76, 74, 82, 80, 56, 68, 57, 59, 34, 38, 'center'),
  ('rendoth', 'LW', 'RW', 86, 71, 69, 83, 44, 63, 24, 71, 31, 33, 'left'),
  ('sampera', 'CM', 'CDM', 72, 69, 81, 77, 70, 74, 44, 54, 36, 40, 'center'),
  ('hansen', 'LB', 'RB', 74, 48, 68, 66, 77, 76, 23, 38, 30, 35, 'left');

insert into public.lineup_variants (id, name, label, description, sort_order, is_active)
values
  ('variant-a', 'Variant A', 'Starting Press', 'Balanced 3-2-2 with Sampera and Amini driving the middle.', 1, true),
  ('variant-b', 'Variant B', 'Control Shape', 'Tighter midfield box with Amini underneath Murugesan.', 2, false),
  ('variant-c', 'Variant C', 'Late Chase', 'Higher line with both wide players pushed on when chasing a goal.', 3, false);

insert into public.lineup_slots (lineup_variant_id, player_id, slot_x, slot_y)
values
  ('variant-a', 'bellgard', 50, 9),
  ('variant-a', 'hansen', 22, 29),
  ('variant-a', 'horak', 50, 24),
  ('variant-a', 'zake', 78, 29),
  ('variant-a', 'sampera', 38, 52),
  ('variant-a', 'amini', 62, 55),
  ('variant-a', 'rendoth', 24, 74),
  ('variant-a', 'murugesan', 68, 76),
  ('variant-b', 'bellgard', 50, 9),
  ('variant-b', 'hansen', 22, 29),
  ('variant-b', 'horak', 42, 28),
  ('variant-b', 'zake', 78, 29),
  ('variant-b', 'sampera', 60, 31),
  ('variant-b', 'amini', 41, 56),
  ('variant-b', 'rendoth', 68, 60),
  ('variant-b', 'murugesan', 50, 79),
  ('variant-c', 'bellgard', 50, 8),
  ('variant-c', 'hansen', 21, 31),
  ('variant-c', 'horak', 49, 26),
  ('variant-c', 'zake', 79, 31),
  ('variant-c', 'sampera', 36, 57),
  ('variant-c', 'amini', 60, 59),
  ('variant-c', 'rendoth', 22, 76),
  ('variant-c', 'murugesan', 69, 77);

insert into public.app_settings (id, manager_token)
values (1, 'mgr_versent_fc_9q8w7e6r5t4y3u2i');

commit;
