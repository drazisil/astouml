// Description: This file contains the parser function that will be used to parse the input file.

/**
 * @typedef {object} Class
 * @property {string} name
 * @property {string[]} attributes
 * @property {string[]} methods
 *
 * @typedef {object} Ast
 * @property {Class[]} classes
 * @property {string[]} associations
 *
 * @typedef {object} ParsedFile
 * @property {Ast} ast
 *
 * @typedef {object} File
 * @property {string} toString
 *
 * @typedef {object} Parser
 * @property {function(File): ParsedFile} parse
 *
 * @typedef {string} Association
 *
 */

const tokenTypes = [
  { type: "LeftCurlyBracket", regex: /^{$/ },
  { type: "RightCurlyBracket", regex: /^}$/ },

  { type: "LeftParenthesis", regex: /^\($/ },
  { type: "RightParenthesis", regex: /^\)$/ },

  { type: "LeftSquareBracket", regex: /^\[$/ },
  { type: "RightSquareBracket", regex: /^\]$/ },

  { type: "LeftAngleBracket", regex: /^<$/ },
  { type: "RightAngleBracket", regex: /^>$/ },

  { type: "Comma", regex: /^,$/ },
  { type: "Semicolon", regex: /^;$/ },

  { type: "Colon", regex: /^:$/ },
  { type: "DoubleColon", regex: /^::$/ },

  { type: "Dot", regex: /^\.$/ },
  { type: "DoubleDot", regex: /^::$/ },

  { type: "Equals", regex: /^=$/ },
  { type: "DoubleEquals", regex: /^==$|^\+=$|^=$|^-=$/ },
  { type: "TripleEquals", regex: /^===$/ },
  { type: "NotEquals", regex: /^!=$/ },
  { type: "NotDoubleEquals", regex: /^!==$/ },
  { type: "Not", regex: /^!$/ },

  { type: "Plus", regex: /^\+$/ },
  { type: "DoublePlus", regex: /^\+\+$/ },
  { type: "Minus", regex: /^-$/ },
  { type: "DoubleMinus", regex: /^--$/ },
  { type: "Asterisk", regex: /^\*$/ },
  { type: "DoubleAsterisk", regex: /^\*\*$/ },
  { type: "Slash", regex: /^\// },
  { type: "DoubleSlash", regex: /^\/\// },
  { type: "Percent", regex: /^%$/ },

  { type: "Ampersand", regex: /^&$/ },
  { type: "DoubleAmpersand", regex: /^&&$/ },
  { type: "Pipe", regex: /^\|$/ },
  { type: "DoublePipe", regex: /^\|\|$/ },
  { type: "Caret", regex: /^\^$/ },
  { type: "Tilde", regex: /^~$/ },

  { type: "LessThan", regex: /^<$/ },
  { type: "LessThanOrEqual", regex: /^<=$/ },
  { type: "GreaterThan", regex: /^>$/ },
  { type: "GreaterThanOrEqual", regex: /^>=$/ },

  { type: "QuestionMark", regex: /^\?$/ },
  { type: "DoubleQuestionMark", regex: /^\?\?$/ },

  { type: "Arrow", regex: /^=>$/ },
  { type: "DoubleArrow", regex: /^=>>$/ },

  { type: "ReservedWord", regex: /^await$/ },
  { type: "ReservedWord", regex: /^break$/ },
  { type: "ReservedWord", regex: /^case$/ },
  { type: "ReservedWord", regex: /^catch$/ },
  { type: "ReservedWord", regex: /^class$/ },
  { type: "ReservedWord", regex: /^const$/ },
  { type: "ReservedWord", regex: /^continue$/ },
  { type: "ReservedWord", regex: /^debugger$/ },
  { type: "ReservedWord", regex: /^default$/ },
  { type: "ReservedWord", regex: /^delete$/ },
  { type: "ReservedWord", regex: /^do$/ },
  { type: "ReservedWord", regex: /^else$/ },
  { type: "ReservedWord", regex: /^enum$/ },
  { type: "ReservedWord", regex: /^export$/ },
  { type: "ReservedWord", regex: /^extends$/ },
  { type: "ReservedWord", regex: /^false$/ },
  { type: "ReservedWord", regex: /^finally$/ },
  { type: "ReservedWord", regex: /^for$/ },
  { type: "ReservedWord", regex: /^function$/ },
  { type: "ReservedWord", regex: /^if$/ },
  { type: "ReservedWord", regex: /^import$/ },
  { type: "ReservedWord", regex: /^in$/ },
  { type: "ReservedWord", regex: /^instanceof$/ },
  { type: "ReservedWord", regex: /^new$/ },
  { type: "ReservedWord", regex: /^null$/ },
  { type: "ReservedWord", regex: /^return$/ },
  { type: "ReservedWord", regex: /^super$/ },
  { type: "ReservedWord", regex: /^switch$/ },
  { type: "ReservedWord", regex: /^this$/ },
  { type: "ReservedWord", regex: /^throw$/ },
  { type: "ReservedWord", regex: /^true$/ },
  { type: "ReservedWord", regex: /^try$/ },
  { type: "ReservedWord", regex: /^typeof$/ },
  { type: "ReservedWord", regex: /^var$/ },
  { type: "ReservedWord", regex: /^void$/ },
  { type: "ReservedWord", regex: /^while$/ },
  { type: "ReservedWord", regex: /^with$/ },
  { type: "ReservedWord", regex: /^yield$/ },

  { type: "Identifier", regex: /^[a-zA-Z_][a-zA-Z0-9_]*$/ },

  { type: "String", regex: /^"[^"]*"$/ },

  { type: "Number", regex: /^[0-9]+$/ },
];

const tokenTypesNotExact = tokenTypes.map((tokenType) => {
  const newTokenType = tokenType.regex
    .toString()
    .replace(/^\/\^/, "/")
    .replace(/\$\/$/, "/");
  console.log("From: " + tokenType.regex.toString(), "To: " + newTokenType);
  return { type: tokenType.type, regex: new RegExp(newTokenType) };
});

export function identifyTypeExact(token) {
  if (tokenTypes.some((tokenType) => tokenType.regex.test(token))) {
    if (
      typeof tokenTypes.find((tokenType) => tokenType.regex.test(token)) !==
      "undefined"
    ) {
      console.log("Exact match found");
      return tokenTypes.find((tokenType) => tokenType.regex.test(token));
    } else {
      console.log("Exact match NOT found");
    }
  }
  console.log("No match found");
  return "unknown";
}

export function identifyTypeNotExact(token) {
  if (tokenTypesNotExact.some((tokenType) => tokenType.regex.test(token))) {
    if (
      typeof tokenTypesNotExact.find((tokenType) =>
        tokenType.regex.test(token)
      ) !== "undefined"
    ) {
      console.log("Non exact match found");
      return tokenTypesNotExact.find((tokenType) =>
        tokenType.regex.test(token)
      );
    } else {
      console.log("Non exact match NOT found");
    }
  }
  console.log("No match found");
  return "unknown";
}

export function identifyType(token) {
  console.log("==================================");
  console.log(
    "Identifying type of token: " + token + " with length: " + token.length
  );
  const exactMatch = identifyTypeExact(token);

  if (exactMatch !== "unknown") {
    return exactMatch;
  }

  const nonExactMatch = identifyTypeNotExact(token);

  if (nonExactMatch !== "unknown") {
    return nonExactMatch;
  }
  console.log("No match found");
  console.log("Returning unknown");
  console.log("==================================");
  return "unknown";
}

/**
 *
 * @param {string} file
 * @returns {object}
 */
export function parse(file) {
  const tokens = [];

  const lines = file.toString().split("\n");

  console.log(lines.length);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const rawTokens = line.split(" ");
    let column = 1;
    for (let j = 0; j < rawTokens.length; j++) {
      const rawToken = rawTokens[j];
      if (rawToken.length === 0) {
        continue;
      }
      const tokenType = identifyType(rawToken);
      if (tokenType !== "unknown") {
        tokens.push({
          type: tokenType?.type,
          lineNumber: i + 1,
          column,
          token: rawToken,
        });
      } else {
        console.log(
          `Unknown token ${rawToken} at line ${i + 1}, column ${column}`
        );
        tokens.push({
          type: "unknown",
          lineNumber: i + 1,
          column,
          token: rawToken,
          rawHex: rawToken
            .toString()
            .split("")
            .map((char) => char.charCodeAt(0).toString(16))
            .join(" "),
          length: rawToken.length,
        });
      }
      column += rawToken.length;
    }
  }

  console.log(tokens.length);

  console.log(tokens);

  console.log("Summary:");
  console.log(
    `  ${
      tokens.filter((token) => token.type === "LeftCurlyBracket").length
    } LeftCurlyBracket`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "RightCurlyBracket").length
    } RightCurlyBracket`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "LeftParenthesis").length
    } LeftParenthesis`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "RightParenthesis").length
    } RightParenthesis`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "LeftSquareBracket").length
    } LeftSquareBracket`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "RightSquareBracket").length
    } RightSquareBracket`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "LeftAngleBracket").length
    } LeftAngleBracket`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "RightAngleBracket").length
    } RightAngleBracket`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Comma").length} Comma`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Semicolon").length} Semicolon`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Colon").length} Colon`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "DoubleColon").length
    } DoubleColon`
  );
  console.log(`  ${tokens.filter((token) => token.type === "Dot").length} Dot`);
  console.log(
    `  ${tokens.filter((token) => token.type === "DoubleDot").length} DoubleDot`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Equals").length} Equals`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "DoubleEquals").length
    } DoubleEquals`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "TripleEquals").length
    } TripleEquals`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "NotEquals").length} NotEquals`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "NotDoubleEquals").length
    } NotDoubleEquals`
  );
  console.log(`  ${tokens.filter((token) => token.type === "Not").length} Not`);
  console.log(
    `  ${tokens.filter((token) => token.type === "Plus").length} Plus`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "DoublePlus").length
    } DoublePlus`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Minus").length} Minus`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "DoubleMinus").length
    } DoubleMinus`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Asterisk").length} Asterisk`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "DoubleAsterisk").length
    } DoubleAsterisk`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Slash").length} Slash`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "DoubleSlash").length
    } DoubleSlash`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Percent").length} Percent`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Ampersand").length} Ampersand`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "DoubleAmpersand").length
    } DoubleAmpersand`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Pipe").length} Pipe`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "DoublePipe").length
    } DoublePipe`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Caret").length} Caret`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Tilde").length} Tilde`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "LessThan").length} LessThan`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "LessThanOrEqual").length
    } LessThanOrEqual`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "GreaterThan").length
    } GreaterThan`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "GreaterThanOrEqual").length
    } GreaterThanOrEqual`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "QuestionMark").length
    } QuestionMark`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "DoubleQuestionMark").length
    } DoubleQuestionMark`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Arrow").length} Arrow`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "DoubleArrow").length
    } DoubleArrow`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "Identifier").length
    } Identifier`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "Number").length} Number`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "String").length} String`
  );
  console.log(
    `  ${
      tokens.filter((token) => token.type === "ReservedWord").length
    } ReservedWord`
  );
  console.log(
    `  ${tokens.filter((token) => token.type === "unknown").length} unknown`
  );

  console.log("Tokens with unknown type:");
  console.log(tokens.filter((token) => token.type === "unknown"));

  process.exit(0);
}
