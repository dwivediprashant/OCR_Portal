const fieldPatterns = {
  name: /(name|applicant\s*name|card\s*holder|holder\s*name)[:\-\s]*([A-Za-z][A-Za-z .]{2,})/i,

  dob: /(dob|d\.?o\.?b\.?|date\s*of\s*birth|birth\s*date)[:\-\s]*([0-3]?\d[\/\-.][01]?\d[\/\-.]\d{2,4})/i,
  idNumber:
    /(id.?no|unique.?id|card.?no|uid|uin|number)[:\-\s]*([A-Z0-9]{5,25})/i,

  gender: /(gender|sex)[:\-\s]*(male|female|other)/i,

  fatherName:
    /(father'?s?\s*name|father|s\/o|son\s*of|d\/o|daughter\s*of|w\/o|wife\s*of|c\/o|care\s*of|guardian\s*name)[:\-\s]*([A-Za-z][A-Za-z .]{2,})/i,

  email:
    /(email|e-?mail)[:\-\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,})/i,

  address:
    /(address|residential\s*address|permanent\s*address|addr|residence)[:\-\s]*([\w\s,.\-\/#]+(?:\n[\w\s,.\-\/#]+){0,3})/i,

  mobile:
    /(mobile|phone|ph\.?|contact|contact\s*no|phone\s*no|mobile\s*no|tel|telephone)[:\-\s]*((\+?91[\s-]?)?[6-9]\d{9})/i,
};

function extractFields(text) {
  const result = {};

  for (let key in fieldPatterns) {
    const match = text.match(fieldPatterns[key]);

    if (!match) {
      result[key] = null;
      continue;
    }

    if (key === "mobile") {
      result[key] = match[2]
        .replace(/\s|-/g, "")
        .replace(/^(\+?91)/, "")
        .trim();
    } else if (key === "email") {
      result[key] = match[2].replace(",", ".").trim();
    } else if (key === "address") {
      // remove extra newlines and trim
      result[key] = match[2].replace(/\n+/g, " ").trim();
    } else {
      result[key] = match[2].trim();
    }
  }

  return result;
}

module.exports = { extractFields };
