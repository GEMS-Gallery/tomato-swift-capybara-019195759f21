import Hash "mo:base/Hash";
import Nat "mo:base/Nat";

import Array "mo:base/Array";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";

actor {
  type Tweet = {
    id: Nat;
    content: Text;
    userId: Text;
    timestamp: Time.Time;
  };

  type UserProfile = {
    userId: Text;
    name: Text;
    bio: Text;
  };

  stable var tweetIdCounter : Nat = 0;
  stable var tweets : [Tweet] = [];
  let userProfiles = HashMap.HashMap<Text, UserProfile>(10, Text.equal, Text.hash);

  public func createTweet(content: Text, userId: Text) : async Result.Result<Tweet, Text> {
    if (Text.size(content) == 0 or Text.size(content) > 280) {
      return #err("Tweet content must be between 1 and 280 characters");
    };

    let tweet : Tweet = {
      id = tweetIdCounter;
      content = content;
      userId = userId;
      timestamp = Time.now();
    };

    tweets := Array.append(tweets, [tweet]);
    tweetIdCounter += 1;
    #ok(tweet)
  };

  public query func getAllTweets() : async [Tweet] {
    Array.reverse(tweets)
  };

  public query func getUserProfile(userId: Text) : async ?UserProfile {
    userProfiles.get(userId)
  };

  public func updateUserProfile(userId: Text, name: Text, bio: Text) : async Result.Result<UserProfile, Text> {
    let profile : UserProfile = {
      userId = userId;
      name = name;
      bio = bio;
    };
    userProfiles.put(userId, profile);
    #ok(profile)
  };

  // System functions for upgrades
  system func preupgrade() {
    // No need to do anything as we're using stable variables
  };

  system func postupgrade() {
    // No need to do anything as we're using stable variables
  };
}
