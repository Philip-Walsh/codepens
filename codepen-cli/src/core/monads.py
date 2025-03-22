from typing import Callable, TypeVar, Generic

T = TypeVar("T")

class Maybe(Generic[T]):
    def __init__(self, value: T | None):
        self.value = value

    def bind(self, func: Callable[[T], "Maybe"]):
        return func(self.value) if self.value is not None else self

    @staticmethod
    def unit(value: T) -> "Maybe[T]":
        return Maybe(value)

    def __repr__(self):
        return f"Just({self.value})" if self.value is not None else "Nothing"

# Example usage
def safe_divide(x: int, y: int) -> Maybe[float]:
    return Maybe.unit(x / y) if y != 0 else Maybe(None)

result = Maybe.unit(10).bind(lambda x: safe_divide(x, 2)).bind(lambda x: safe_divide(x, 0))
print(result)  # Output: Nothing
