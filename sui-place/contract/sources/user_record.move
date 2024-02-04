module place::user_record {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::clock::{Self, Clock};

    friend place::place;

    struct UserRecord has key, store {
        id: UID,
        last_accessed: u64,
        access_counter: u64,
    }

    public(friend) fun new(clock: &Clock, ctx: &mut TxContext): UserRecord {
        UserRecord {
            id: object::new(ctx),
            last_accessed: clock::timestamp_ms(clock),
            access_counter: 1,
        }
    }

    public(friend) fun update(self: &mut UserRecord, clock: &Clock) {
        self.last_accessed = clock::timestamp_ms(clock);
        self.access_counter = self.access_counter + 1;
    }

    public(friend) fun check_if_time_is_valid(self: &UserRecord, clock: &Clock, cooldown: u64): bool {
        (clock::timestamp_ms(clock) - self.last_accessed) > cooldown
    }

    public entry fun get_details(self: &UserRecord): (u64, u64) {
        (self.last_accessed, self.access_counter)
    }
} 