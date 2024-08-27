import Hash "mo:base/Hash";
import Nat "mo:base/Nat";

import Array "mo:base/Array";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";

actor {
  type TweetId = Nat;
  type UserId = Principal;

  type Tweet = {
    id: TweetId;
    content: Text;
    author: UserId;
    timestamp: Time.Time;
    likes: Nat;
    retweets: Nat;
  };

  type UserProfile = {
    userId: UserId;
    username: Text;
    bio: Text;
    following: [UserId];
    followers: [UserId];
  };

  stable var tweetIdCounter : Nat = 0;
  stable var tweetEntries : [(TweetId, Tweet)] = [];
  var tweets = Buffer.Buffer<(TweetId, Tweet)>(0);
  let userProfiles = HashMap.HashMap<UserId, UserProfile>(10, Principal.equal, Principal.hash);

  public shared({ caller }) func create_tweet(content: Text) : async Result.Result<Tweet, Text> {
    if (Principal.isAnonymous(caller)) {
      return #err("Authentication required");
    };

    if (Text.size(content) == 0 or Text.size(content) > 280) {
      return #err("Tweet content must be between 1 and 280 characters");
    };

    let tweet : Tweet = {
      id = tweetIdCounter;
      content = content;
      author = caller;
      timestamp = Time.now();
      likes = 0;
      retweets = 0;
    };

    tweets.add((tweetIdCounter, tweet));
    tweetIdCounter += 1;
    #ok(tweet)
  };

  public query func get_all_tweets() : async [Tweet] {
    Array.reverse(Array.map<(TweetId, Tweet), Tweet>(Buffer.toArray(tweets), func((_, tweet)) { tweet }))
  };

  public query func get_user_profile(userId: UserId) : async Result.Result<UserProfile, Text> {
    switch (userProfiles.get(userId)) {
      case null {
        let newProfile : UserProfile = {
          userId = userId;
          username = "";
          bio = "";
          following = [];
          followers = [];
        };
        userProfiles.put(userId, newProfile);
        #ok(newProfile)
      };
      case (?profile) { #ok(profile) };
    }
  };

  public shared({ caller }) func update_user_profile(username: Text, bio: Text) : async Result.Result<UserProfile, Text> {
    if (Principal.isAnonymous(caller)) {
      return #err("Authentication required");
    };

    let profile : UserProfile = {
      userId = caller;
      username = username;
      bio = bio;
      following = [];
      followers = [];
    };
    userProfiles.put(caller, profile);
    #ok(profile)
  };

  public shared({ caller }) func like_tweet(tweetId: TweetId) : async Result.Result<Tweet, Text> {
    if (Principal.isAnonymous(caller)) {
      return #err("Authentication required");
    };

    let tweetIndex = Buffer.indexOf<(TweetId, Tweet)>((tweetId, { id = tweetId; content = ""; author = caller; timestamp = 0; likes = 0; retweets = 0 }), tweets, func((id1, _), (id2, _)) { id1 == id2 });
    switch (tweetIndex) {
      case null { #err("Tweet not found") };
      case (?index) {
        let (_, tweet) = tweets.get(index);
        let updatedTweet = {
          id = tweet.id;
          content = tweet.content;
          author = tweet.author;
          timestamp = tweet.timestamp;
          likes = tweet.likes + 1;
          retweets = tweet.retweets;
        };
        tweets.put(index, (tweetId, updatedTweet));
        #ok(updatedTweet)
      };
    }
  };

  public shared({ caller }) func retweet(tweetId: TweetId) : async Result.Result<Tweet, Text> {
    if (Principal.isAnonymous(caller)) {
      return #err("Authentication required");
    };

    let tweetIndex = Buffer.indexOf<(TweetId, Tweet)>((tweetId, { id = tweetId; content = ""; author = caller; timestamp = 0; likes = 0; retweets = 0 }), tweets, func((id1, _), (id2, _)) { id1 == id2 });
    switch (tweetIndex) {
      case null { #err("Tweet not found") };
      case (?index) {
        let (_, tweet) = tweets.get(index);
        let updatedTweet = {
          id = tweet.id;
          content = tweet.content;
          author = tweet.author;
          timestamp = tweet.timestamp;
          likes = tweet.likes;
          retweets = tweet.retweets + 1;
        };
        tweets.put(index, (tweetId, updatedTweet));
        #ok(updatedTweet)
      };
    }
  };

  public shared({ caller }) func follow_user(userToFollow: UserId) : async Result.Result<(), Text> {
    if (Principal.isAnonymous(caller)) {
      return #err("Authentication required");
    };

    switch (userProfiles.get(caller), userProfiles.get(userToFollow)) {
      case (null, _) { #err("Follower profile not found") };
      case (_, null) { #err("User to follow not found") };
      case (?followerProfile, ?followeeProfile) {
        let updatedFollowerProfile = {
          userId = followerProfile.userId;
          username = followerProfile.username;
          bio = followerProfile.bio;
          following = Array.append(followerProfile.following, [userToFollow]);
          followers = followerProfile.followers;
        };
        let updatedFolloweeProfile = {
          userId = followeeProfile.userId;
          username = followeeProfile.username;
          bio = followeeProfile.bio;
          following = followeeProfile.following;
          followers = Array.append(followeeProfile.followers, [caller]);
        };
        userProfiles.put(caller, updatedFollowerProfile);
        userProfiles.put(userToFollow, updatedFolloweeProfile);
        #ok()
      };
    }
  };

  public query func get_user_feed(userId: UserId) : async [Tweet] {
    switch (userProfiles.get(userId)) {
      case null { [] };
      case (?profile) {
        let followingTweets = Buffer.mapFilter<(TweetId, Tweet), Tweet>(tweets, func((_, tweet)) {
          if (Array.indexOf<UserId>(tweet.author, profile.following, Principal.equal) != null) {
            ?tweet
          } else {
            null
          }
        });
        Array.reverse(Buffer.toArray(followingTweets))
      };
    }
  };

  // System functions for upgrades
  system func preupgrade() {
    tweetEntries := Buffer.toArray(tweets);
  };

  system func postupgrade() {
    tweets := Buffer.fromArray(tweetEntries);
  };
}
