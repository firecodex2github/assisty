import re
import bleach

def sanitize_text(value: str) -> str:
    if not value:
        return ""

    #  Remove script blocks completely
    value = re.sub(
        r"<script.*?>.*?</script>",
        "",
        value,
        flags=re.IGNORECASE | re.DOTALL  #flags -mode ,Without DOTALL  does NOT match newlines.  "|" Enable BOTH flags together
    )

    #  Clean remaining HTML
    value = bleach.clean(
        value,
        tags=[],
        attributes={},
        strip=True
    )

    return value.strip() #removes extra spaces
