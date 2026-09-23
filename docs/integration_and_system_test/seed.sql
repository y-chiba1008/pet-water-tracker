-- 結合・総合試験 セット C 用シード
-- 前提: db reset 済み、pnpm seed-users 済み（public.users が 1 件以上）
-- 日時は Asia/Tokyo の暦日。アプリの日別キー（ローカル日付）と揃える

BEGIN;

DO $$
DECLARE
  uid uuid;
  bowl_living uuid;
  bowl_bedroom uuid;
  tokyo_today date;
  d_minus_1 date;
  d_minus_2 date;
  d_minus_29 date;
  d_minus_30 date;
  prev_month_last date;
BEGIN
  SELECT id INTO uid
  FROM public.users
  ORDER BY created_at ASC
  LIMIT 1;

  IF uid IS NULL THEN
    RAISE EXCEPTION 'public.users が空です。先に pnpm seed-users を実行してください。';
  END IF;

  tokyo_today := (now() AT TIME ZONE 'Asia/Tokyo')::date;
  d_minus_1 := tokyo_today - 1;
  d_minus_2 := tokyo_today - 2;
  d_minus_29 := tokyo_today - 29;
  d_minus_30 := tokyo_today - 30;
  prev_month_last := (date_trunc('month', tokyo_today::timestamp))::date - 1;

  INSERT INTO public.bowls (name, is_active)
  VALUES ('集計用リビング', true)
  RETURNING id INTO bowl_living;

  INSERT INTO public.bowls (name, is_active)
  VALUES ('集計用寝室', true)
  RETURNING id INTO bowl_bedroom;

  -- TD-BR-01: D-2 20:00 → D-1 08:00 / 200-80 = 120ml → D-1
  INSERT INTO public.bowl_records (
    bowl_id,
    start_time,
    start_amount_ml,
    start_recorded_by,
    end_time,
    end_amount_ml,
    end_recorded_by
  ) VALUES (
    bowl_living,
    (d_minus_2 + time '20:00') AT TIME ZONE 'Asia/Tokyo',
    200,
    uid,
    (d_minus_1 + time '08:00') AT TIME ZONE 'Asia/Tokyo',
    80,
    uid
  );

  -- TD-BR-02: D-1 08:00 → D 08:00 / 200-50 = 150ml → 終了日 D に全量
  INSERT INTO public.bowl_records (
    bowl_id,
    start_time,
    start_amount_ml,
    start_recorded_by,
    end_time,
    end_amount_ml,
    end_recorded_by
  ) VALUES (
    bowl_living,
    (d_minus_1 + time '08:00') AT TIME ZONE 'Asia/Tokyo',
    200,
    uid,
    (tokyo_today + time '08:00') AT TIME ZONE 'Asia/Tokyo',
    50,
    uid
  );

  -- TD-BR-03: 進行中。集計に載せない
  INSERT INTO public.bowl_records (
    bowl_id,
    start_time,
    start_amount_ml,
    start_recorded_by
  ) VALUES (
    bowl_living,
    (tokyo_today + time '08:00') AT TIME ZONE 'Asia/Tokyo',
    200,
    uid
  );

  -- TD-BR-04: 寝室 D-1 完了 50ml
  INSERT INTO public.bowl_records (
    bowl_id,
    start_time,
    start_amount_ml,
    start_recorded_by,
    end_time,
    end_amount_ml,
    end_recorded_by
  ) VALUES (
    bowl_bedroom,
    (d_minus_1 + time '10:00') AT TIME ZONE 'Asia/Tokyo',
    150,
    uid,
    (d_minus_1 + time '18:00') AT TIME ZONE 'Asia/Tokyo',
    100,
    uid
  );

  INSERT INTO public.individual_records (recorded_at, amount_ml, recorded_by)
  VALUES
    ((tokyo_today + time '12:00') AT TIME ZONE 'Asia/Tokyo', 10, uid),
    ((d_minus_1 + time '12:00') AT TIME ZONE 'Asia/Tokyo', 20, uid),
    ((d_minus_29 + time '12:00') AT TIME ZONE 'Asia/Tokyo', 30, uid),
    ((d_minus_30 + time '12:00') AT TIME ZONE 'Asia/Tokyo', 40, uid),
    ((prev_month_last + time '12:00') AT TIME ZONE 'Asia/Tokyo', 70, uid);
END $$;

COMMIT;
