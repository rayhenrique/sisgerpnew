DO $$
DECLARE
  v_email text := 'rayhenrique@gmail.com';
  v_user_id uuid;
  v_old_role text;
  v_old_name text;
  v_old_active boolean;
BEGIN
  SELECT u.id
    INTO v_user_id
  FROM auth.users u
  WHERE u.email = v_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users', v_email;
  END IF;

  SELECT p.name, p.role, p.active
    INTO v_old_name, v_old_role, v_old_active
  FROM public.profiles p
  WHERE p.id = v_user_id;

  IF v_old_role IS NULL THEN v_old_role := 'operator'; END IF;
  IF v_old_active IS NULL THEN v_old_active := true; END IF;

  INSERT INTO public.profiles (id, name, role, active, updated_at)
  VALUES (v_user_id, NULL, 'superadmin', true, now())
  ON CONFLICT (id) DO UPDATE
    SET role = 'superadmin',
        active = true,
        updated_at = now();

  IF (SELECT p.role FROM public.profiles p WHERE p.id = v_user_id) <> 'superadmin' THEN
    RAISE EXCEPTION 'Failed to promote % to superadmin', v_email;
  END IF;

  IF v_old_role IS DISTINCT FROM 'superadmin' THEN
    INSERT INTO public.audit_logs (user_id, action, model_type, model_id, old_values, new_values)
    VALUES (
      v_user_id,
      'user.role.change',
      'profiles',
      0,
      jsonb_build_object(
        'targetUserId', v_user_id,
        'targetEmail', v_email,
        'name', v_old_name,
        'role', v_old_role,
        'status', CASE WHEN v_old_active THEN 'active' ELSE 'disabled' END
      ),
      jsonb_build_object(
        'actorEmail', v_email,
        'actorRole', 'superadmin',
        'bootstrap', true,
        'targetUserId', v_user_id,
        'targetEmail', v_email,
        'name', v_old_name,
        'role', 'superadmin',
        'status', 'active'
      )
    );
  END IF;
END $$;
