
-- Consulta relacional que devuelve notas junto con sus checklist items y etiquetas.
-- LEFT JOIN se usa porque una nota puede no tener items o tags.
-- json_agg agrupa los valores de la tabla relacionada en un arreglo JSON.

SELECT
  n.id,
  n.title,
  n.type,
  n.content,
  n.color,
  n.created_at AS "createdAt",
  n.updated_at AS "updatedAt",
  COALESCE(
    json_agg(DISTINCT jsonb_build_object(
      'id', ci.id,
      'text', ci.text,
      'isCompleted', ci.is_completed
    )) FILTER (WHERE ci.id IS NOT NULL),
    '[]'
  ) AS items,
  COALESCE(
    json_agg(DISTINCT nt.tag) FILTER (WHERE nt.tag IS NOT NULL),
    '[]'
  ) AS tags
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id
LEFT JOIN note_tags nt ON n.id = nt.note_id
GROUP BY n.id
ORDER BY n.created_at DESC;
