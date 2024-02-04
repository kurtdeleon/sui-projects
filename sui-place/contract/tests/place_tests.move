#[test_only]
module place::place_tests {
    use place::place::{Self, Place, PlaceAdminCapability};

    use std::debug;
    use sui::clock;
    use sui::test_scenario::{Self as ts, Scenario};

    const ADMIN: address = @0xABCD;

    /// Given an instance of a scenario, this codeblock initializes 
    /// and populates a Place instance to prevent too much boilerplate
    fun init_place(place_size: u64, scenario: &mut Scenario) {
        place::create_place(ts::ctx(scenario));
        ts::next_tx(scenario, ADMIN);
        {
            let place_instance = ts::take_shared<Place>(scenario);
            let admin_capability = ts::take_from_sender<PlaceAdminCapability>(scenario);
            // Initialize pixels inside place
            place::add_pixels(&mut place_instance, place_size, &admin_capability);
            ts::return_shared(place_instance);
            ts::return_to_sender(scenario, admin_capability);
        };
    }

    #[test]
    fun basic_test() {
        let scenario_val = ts::begin(ADMIN);
        let scenario = &mut scenario_val;
        let clock_instance = clock::create_for_testing(ts::ctx(scenario));
        init_place(2, scenario);

        ts::next_tx(scenario, ADMIN);
        {
            let place_instance = ts::take_shared<Place>(scenario);
            // set 1st pixel to black
            place::set_color(&mut place_instance, &clock_instance, 0, 0, 0, 0, ts::ctx(scenario));
            clock::increment_for_testing(&mut clock_instance, 60001); // 1ms after cooldown
            place::set_color(&mut place_instance, &clock_instance, 1, 255, 0, 0, ts::ctx(scenario));

            debug::print<vector<vector<u8>>>(&place::get_colors(&place_instance));
            ts::return_shared(place_instance);
        };

        clock::destroy_for_testing(clock_instance);
        ts::end(scenario_val);
    }

    #[test]
    fun multiple_users_test() {
        let user1 = @0xCFEA;
        let user2 = @0xCFBA;
        let user3 = @0xCBAF;
        let scenario_val = ts::begin(ADMIN);
        let scenario = &mut scenario_val;
        let clock_instance = clock::create_for_testing(ts::ctx(scenario));
        init_place(4, scenario);

        // User1 sets Pixel #1 to black
        ts::next_tx(scenario, user1);
        {
            let place_instance = ts::take_shared<Place>(scenario);

            place::set_color(&mut place_instance, &clock_instance, 0, 0, 0, 0, ts::ctx(scenario));
            clock::increment_for_testing(&mut clock_instance, 10);

            debug::print<vector<vector<u8>>>(&place::get_colors(&place_instance));
            ts::return_shared(place_instance);
        };

        // User2 sets Pixel #2 to red
        ts::next_tx(scenario, user2);
        {
            let place_instance = ts::take_shared<Place>(scenario);

            place::set_color(&mut place_instance, &clock_instance, 1, 255, 0, 0, ts::ctx(scenario));
            clock::increment_for_testing(&mut clock_instance, 10);

            debug::print<vector<vector<u8>>>(&place::get_colors(&place_instance));
            ts::return_shared(place_instance);
        };

        // User3 sets Pixel #1 to blue, overwriting User1's color
        ts::next_tx(scenario, user3);
        {
            let place_instance = ts::take_shared<Place>(scenario);

            place::set_color(&mut place_instance, &clock_instance, 0, 0, 0, 255, ts::ctx(scenario));
            clock::increment_for_testing(&mut clock_instance, 10);

            debug::print<vector<vector<u8>>>(&place::get_colors(&place_instance));
            ts::return_shared(place_instance);
        };

        // User2 sets Pixel #1 to green, overwriting User3's color
        ts::next_tx(scenario, user2);
        {
            let place_instance = ts::take_shared<Place>(scenario);

            clock::increment_for_testing(&mut clock_instance, 350000); // set cooldown to valid
            place::set_color(&mut place_instance, &clock_instance, 0, 0, 255, 0, ts::ctx(scenario));

            debug::print<vector<vector<u8>>>(&place::get_colors(&place_instance));
            ts::return_shared(place_instance);
        };

        // Creates a new user and checks if get_user_record returns default values
        let new_user = @0xAAAB;
        ts::next_tx(scenario, new_user);
        {
           let place_instance = ts::take_shared<Place>(scenario);
           let (last_accessed, access_counter) = place::get_user_record(&place_instance, ts::ctx(scenario));

           // should be 0, 0
           debug::print<u64>(&last_accessed);
           debug::print<u64>(&access_counter);

           ts::return_shared(place_instance);
        };

        clock::destroy_for_testing(clock_instance);
        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = place::place::USER_ON_COOLDOWN)]
    fun err_cooldown_test() {
        let scenario_val = ts::begin(ADMIN);
        let scenario = &mut scenario_val;
        let clock_instance = clock::create_for_testing(ts::ctx(scenario));
        init_place(2, scenario);

        // Modify a pixel's color
        ts::next_tx(scenario, ADMIN);
        {
            let place_instance = ts::take_shared<Place>(scenario);
            // Set 1st pixel to black
            place::set_color(&mut place_instance, &clock_instance, 0, 0, 0, 0, ts::ctx(scenario));
            // Set to 1ms before cooldown
            clock::increment_for_testing(&mut clock_instance, 59999);
            // Attempt to set second pixel, which should fail
            place::set_color(&mut place_instance, &clock_instance, 1, 255, 0, 0, ts::ctx(scenario));

            ts::return_shared(place_instance);
        };

        clock::destroy_for_testing(clock_instance);
        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = place::place::PLACE_IS_FROZEN)]
    fun err_frozen_test() {
        let scenario_val = ts::begin(ADMIN);
        let scenario = &mut scenario_val;
        let clock_instance = clock::create_for_testing(ts::ctx(scenario));
        init_place(2, scenario);

        // Modify a pixel's color
        ts::next_tx(scenario, ADMIN);
        {
            let place_instance = ts::take_shared<Place>(scenario);
            // Set 1st pixel to black
            place::set_color(&mut place_instance, &clock_instance, 0, 0, 0, 0, ts::ctx(scenario));
            clock::increment_for_testing(&mut clock_instance, 60001);
            // Freeze place
            let admin_capability = ts::take_from_sender<PlaceAdminCapability>(scenario);
            place::set_frozen(&mut place_instance, 1, &admin_capability);
            // Attempt to set second pixel, which should fail because Place is frozen
            place::set_color(&mut place_instance, &clock_instance, 0, 255, 255, 255, ts::ctx(scenario));

            ts::return_shared(place_instance);
            ts::return_to_sender(scenario, admin_capability);
        };

        clock::destroy_for_testing(clock_instance);
        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = place::place::INVALID_SIZE)]
    fun err_invalid_size_test() {
        let scenario_val = ts::begin(ADMIN);
        let scenario = &mut scenario_val;
        let clock_instance = clock::create_for_testing(ts::ctx(scenario));
        init_place(2, scenario);

        // Modify a pixel's color
        ts::next_tx(scenario, ADMIN);
        {
            let place_instance = ts::take_shared<Place>(scenario);
            // Attempt to access a 3rd element which doesn't exist
            place::set_color(&mut place_instance, &clock_instance, 2, 0, 0, 0, ts::ctx(scenario));
            ts::return_shared(place_instance);
        };

        clock::destroy_for_testing(clock_instance);
        ts::end(scenario_val);
    }
}