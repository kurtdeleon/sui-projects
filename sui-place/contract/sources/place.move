
/// This is an attempt to emulate Rdit's /r/place, which is a 
/// collaborative app that lets users set the color of any pixel 
/// set on a canvas. Like /r/place, users are put on a cooldown
/// everytime a pixel is modified to prevent abuse.
/// 
/// Admins (instantiators) are allowed to call a number of managerial
/// functions, such as adding more pixels, and freezing the canvas.
/// 
/// Feature ideas:
/// - Freeze a pixel for a set amount of time by paying more
/// - Allow users to "bid" for a Pixel's color
/// - Dynamic cooldown time/fees depending on how often a Pixel is modified
module place::place {
    use place::pixel::{Self, Pixel};
    use place::user_record::{Self, UserRecord};

    use std::vector;
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::clock::Clock;

    /// Default cooldown time after user sets a pixel's color attribute
    const COOLDOWN_TIME: u64 = 60000;
    /// User is still on cooldown from modifying a pixel 
    const USER_ON_COOLDOWN: u64 = 0;
    /// Place is set to frozen, so no functions are allowed to fire
    const PLACE_IS_FROZEN: u64 = 1;
    /// The user calling an instantiation of Place is providing an invalid size
    const INVALID_SIZE: u64 = 2;

    /// Will allow the instantiator of the Place object to be the
    /// administrator of the object that is being created.
    struct PlaceAdminCapability has key, store { id: UID }
    
    /// Main struct for the parent component of this program
    struct Place has key, store {
        id: UID,
        /// Vector of all Pixels that is owned by this instance
        pixels: vector<Pixel>,
        /// Contains info about all the keypairs that interact with pixels
        user_records: Table<address, UserRecord>,
        /// Determines if any user can call modifying functions
        frozen: bool,
    }

    /// Caller creates a new Place instance and assigns itself as admin
    public entry fun create_place(ctx: &mut TxContext) {
        // Create Place object and set it as a public object
        transfer::public_share_object(
            Place {
                id: object::new(ctx),
                pixels: vector<Pixel>[],
                user_records: table::new(ctx),
                frozen: false,
            }
        );

        // Create admin capability and assign it to instantiator
        transfer::public_transfer(
            PlaceAdminCapability { id: object::new(ctx) },
            tx_context::sender(ctx)
        );
    }

    /// Given a pixel's index, update its data
    public entry fun set_color(
        self: &mut Place, clock: &Clock, pixel_index: u64,
        r: u8, g: u8, b: u8, ctx: &mut TxContext
    ) {
        assert!(!self.frozen, PLACE_IS_FROZEN);
        assert!(vector::length(&self.pixels) > pixel_index, INVALID_SIZE);

        if (!table::contains(&self.user_records, tx_context::sender(ctx))) {
            // Create new record and add it to user_records table
            table::add(&mut self.user_records, tx_context::sender(ctx), user_record::new(clock, ctx));
        } else {
            // Find user's record inside table, and assert that user is not on cooldown
            let record: &mut UserRecord = table::borrow_mut(&mut self.user_records, tx_context::sender(ctx));
            assert!(user_record::check_if_time_is_valid(record, clock, COOLDOWN_TIME), USER_ON_COOLDOWN);
            // If user is in a valid state, update user's record 
            user_record::update(record, clock);
        };

        // Finally, update the Pixel's color
        let pixel_to_update: &mut Pixel = vector::borrow_mut(&mut self.pixels, pixel_index);
        pixel::set_color(pixel_to_update, r, g, b);
    }

    // ********************* //
    //    Getter functions   //
    // ********************* //

    /// Returns a data map of all Pixels for a Place
    public entry fun get_colors(self: &Place): vector<vector<u8>> {
        let color_data: vector<vector<u8>> = vector[];
        let i: u64 = 0;
        while (i < vector::length(&self.pixels)) {
            let pixel = vector::borrow(&self.pixels, i);
            vector::push_back(&mut color_data, pixel::get_color(pixel));
            i = i + 1;
        };
        color_data
    }

    /// Finds a user's record in the records table
    public entry fun get_user_record(self: &Place, ctx: &mut TxContext): (u64, u64) {
        // If no entry, just return default value
        if (!table::contains(&self.user_records, tx_context::sender(ctx))) {
            return (0, 0)
        };

        // Else, find user's record and return details
        let record = table::borrow(&self.user_records, tx_context::sender(ctx));
        user_record::get_details(record)
    }

    // ********************* //
    //    Admin functions    //
    // ********************* //

    /// Adds an arbitrary amount of pixels to the pixel array,
    /// with color set to white as default
    public entry fun add_pixels(self: &mut Place, number_of_pixels: u64, _cap: &PlaceAdminCapability) {
        let _pixels: vector<Pixel> = vector[];
        let i: u64 = 0;
        while (i < number_of_pixels) {
            vector::push_back(&mut self.pixels, pixel::new(255, 255, 255));
            i = i + 1;
        }
    }
    
    /// Updates frozen property
    /// 0 for `true`, anything else for `false`
    public entry fun set_frozen(self: &mut Place, new_state: u64, _cap: &PlaceAdminCapability) {
        self.frozen = new_state > 0;
    }
} 