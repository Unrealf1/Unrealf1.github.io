#include <iostream>


void print_tuple(unsigned int tuple_size) {
    if (tuple_size == 0) {
        std::cout << "{}";
        return;
    }

    std::cout << "{ " << tuple_size << ", { " << tuple_size << ", ";
    print_tuple(tuple_size - 1);
    std::cout << " }";
}

int main() {
    unsigned int n = 0;
    std::cin >> n;
    print_tuple(n);
    std::cout << '\n';
}