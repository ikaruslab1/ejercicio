import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    return res.status(500).json({ error: 'DATABASE_URL no configurada en Vercel' });
  }

  const sql = neon(connectionString);

  try {
    if (req.method === 'GET') {
      const [prs, history, profile] = await Promise.all([
        sql`SELECT * FROM personal_records;`,
        sql`SELECT * FROM workout_sessions ORDER BY start_time DESC;`,
        sql`SELECT * FROM user_profile WHERE id = 'default_user' LIMIT 1;`
      ]);

      return res.status(200).json({
        ok: true,
        prs,
        history,
        profile: profile[0] || null
      });
    }

    if (req.method === 'POST') {
      const { type, payload } = req.body;

      if (type === 'save_pr') {
        const { exerciseId, exerciseName, muscleGroup, maxWeight, repsAtMaxWeight, estimated1RM, achievedDate, history } = payload;
        await sql`
          INSERT INTO personal_records (exercise_id, exercise_name, muscle_group, max_weight, reps_at_max_weight, estimated_1rm, achieved_date, history, updated_at)
          VALUES (${exerciseId}, ${exerciseName}, ${muscleGroup}, ${maxWeight}, ${repsAtMaxWeight}, ${estimated1RM}, ${achievedDate}, ${JSON.stringify(history)}::jsonb, CURRENT_TIMESTAMP)
          ON CONFLICT (exercise_id) DO UPDATE SET
            max_weight = EXCLUDED.max_weight,
            reps_at_max_weight = EXCLUDED.reps_at_max_weight,
            estimated_1rm = EXCLUDED.estimated_1rm,
            achieved_date = EXCLUDED.achieved_date,
            history = EXCLUDED.history,
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({ ok: true });
      }

      if (type === 'save_session') {
        const { id, dayId, weekNumber, dayNumber, dayKey, dayTitle, startTime, endTime, durationSeconds, exercises, totalVolumeKg, totalSetsCompleted, notes, rating } = payload;
        await sql`
          INSERT INTO workout_sessions (id, day_id, week_number, day_number, day_key, day_title, start_time, end_time, duration_seconds, exercises, total_volume_kg, total_sets_completed, notes, rating, created_at)
          VALUES (${id}, ${dayId}, ${weekNumber || 1}, ${dayNumber || 1}, ${dayKey || null}, ${dayTitle}, ${startTime}, ${endTime}, ${durationSeconds}, ${JSON.stringify(exercises)}::jsonb, ${totalVolumeKg}, ${totalSetsCompleted}, ${notes}, ${rating}, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET notes = EXCLUDED.notes, rating = EXCLUDED.rating;
        `;
        return res.status(200).json({ ok: true });
      }

      if (type === 'save_profile') {
        const { name, age, weightKg, heightCm, goal, activityFactor } = payload;
        await sql`
          INSERT INTO user_profile (id, name, age, weight_kg, height_cm, goal, activity_factor, updated_at)
          VALUES ('default_user', ${name}, ${age}, ${weightKg}, ${heightCm}, ${goal}, ${activityFactor}, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            age = EXCLUDED.age,
            weight_kg = EXCLUDED.weight_kg,
            height_cm = EXCLUDED.height_cm,
            goal = EXCLUDED.goal,
            activity_factor = EXCLUDED.activity_factor,
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'Tipo de operación no reconocido' });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('Error en /api/sync:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
