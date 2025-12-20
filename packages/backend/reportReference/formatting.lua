-- formatting.lua
function Header(el)
  if el.level == 1 then
    -- Insert a page break before every h1 header
    return {pandoc.RawBlock('openxml', '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'), el}
  else
    return el
  end
end

