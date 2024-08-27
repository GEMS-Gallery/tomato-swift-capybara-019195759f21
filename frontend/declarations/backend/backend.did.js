export const idlFactory = ({ IDL }) => {
  const TweetId = IDL.Nat;
  const UserId = IDL.Principal;
  const Time = IDL.Int;
  const Tweet = IDL.Record({
    'id' : TweetId,
    'retweets' : IDL.Nat,
    'content' : IDL.Text,
    'author' : UserId,
    'likes' : IDL.Nat,
    'timestamp' : Time,
  });
  const Result_1 = IDL.Variant({ 'ok' : Tweet, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const UserProfile = IDL.Record({
    'bio' : IDL.Text,
    'username' : IDL.Text,
    'userId' : UserId,
    'followers' : IDL.Vec(UserId),
    'following' : IDL.Vec(UserId),
  });
  const Result = IDL.Variant({ 'ok' : UserProfile, 'err' : IDL.Text });
  return IDL.Service({
    'createTweet' : IDL.Func([IDL.Text], [Result_1], []),
    'followUser' : IDL.Func([UserId], [Result_2], []),
    'getAllTweets' : IDL.Func([], [IDL.Vec(Tweet)], ['query']),
    'getUserFeed' : IDL.Func([UserId], [IDL.Vec(Tweet)], ['query']),
    'getUserProfile' : IDL.Func([UserId], [Result], ['query']),
    'likeTweet' : IDL.Func([TweetId], [Result_1], []),
    'retweet' : IDL.Func([TweetId], [Result_1], []),
    'updateUserProfile' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
