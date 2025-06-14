console.log('Hello, TypeScript!');

// function square(x: NumberWithLogs): NumberWithLogs {
//   let result = x.result * x.result;
//   return {
//     result,
//     logs: x.logs.concat([`Squared ${x.result} to get ${result}`]),
//   };
// }

// function addOne(x: NumberWithLogs): NumberWithLogs {
//   let result = x.result + 1;
//   return {
//     result,
//     logs: x.logs.concat([`Added 1 to ${x.result} to get ${result}`]),
//   };
// }

// let initial: NumberWithLogs = { result: 2, logs: [] };

// Pass the object to square and then addOne
// var resultWithLogs = addOne(square(initial)); // Pass `initial` as a NumberWithLogs object

// console.log(resultWithLogs);

interface NumberWithLogs {
  result: number;
  logs: string[];
}

function square(x: number): NumberWithLogs {
  const result = x * x;
  return {
    result,
    logs: [`Squared ${x} to get ${result}`],
  };
}

function addOne(x: number): NumberWithLogs {
  const result = x + 1;
  return {
    result,
    logs: [`Added 1 to ${x} to get ${result}`],
  };
}
function wrapWithLogs(x: number): NumberWithLogs {
  return {
    result: x,
    logs: [],
  };
}
function runWithLogs(
  input: NumberWithLogs,
  transform: (_: number) => NumberWithLogs
): NumberWithLogs {
  const newNumberWithLogs = transform(input.result);
  return {
    result: newNumberWithLogs.result,
    logs: input.logs.concat(newNumberWithLogs.logs),
  };
}

let aaaa = runWithLogs(wrapWithLogs(5), addOne);
console.log(aaaa);

aaaa = runWithLogs(aaaa, square);

console.log(aaaa);
