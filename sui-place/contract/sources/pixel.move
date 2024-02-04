module place::pixel {
    friend place::place;

    struct Pixel has copy, store, drop {
        r: u8,
        g: u8,
        b: u8,
    }

    public(friend) fun new(r: u8, g: u8, b: u8): Pixel {
        Pixel { r, g, b }
    }

    public(friend) fun set_color(self: &mut Pixel, r: u8, g: u8, b: u8) {
        self.r = r;
        self.g = g;
        self.b = b;
    }

    public(friend) fun get_color(self: &Pixel): vector<u8> {
        vector[self.r, self.g, self.b]
    }
} 