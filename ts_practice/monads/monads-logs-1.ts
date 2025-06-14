console.log('Hello, TypeScript!');

function square(x: number): number {
  return x * x;
}

function addOne(x: number): number {
  return x + 1;
}

const a = addOne(square(2));
console.log(a);
