-- The English "working student" phrase slipped through alongside its German
-- equivalent "werkstudent" — German job boards frequently post bilingual
-- titles, so both need to be excluded.
update public.filter_config
set exclude_title_keywords = array(
  select distinct unnest(exclude_title_keywords || array['working student'])
);
