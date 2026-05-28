
SELECT 
  n.*,
  COALESCE(json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL), '[]') as items,
  COALESCE(json_agg(DISTINCT nt.tag) FILTER (WHERE nt.id IS NOT NULL), '[]') as tags
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id
LEFT JOIN note_tags nt ON n.id = nt.note_id
GROUP BY n.id
ORDER BY n.created_at DESC;