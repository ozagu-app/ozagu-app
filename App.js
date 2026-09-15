import "react-native-get-random-values";
import React, { useEffect, useMemo, useState } from 'react';
  import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ScrollView,
  Modal,
  Image,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  Animated,
  AppState,

} from "react-native";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallContent,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import * as ImagePicker from "expo-image-picker";
import { useFonts } from "expo-font";
import { Ionicons } from 
"@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import AsyncStorage from 
'@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { createClient } from '@supabase/supabase-js';
let ozaguNavigate = null;
c
onst SUPABASE_URL = 'https://wtfuefyzoopllgmusfbp.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4sUP8WrlUcLQFKUFHNq0cw_CQP_imy-';
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const OZAGU = {
  background: "#080808",
  surface: "#111111",
  surface2: "#171717",
  border: "#242424",
  white: "#FFFFFF",
  muted: "#8A8A8A",
  violet: "#7C3AED",
  purple: "#A855F7",
  blue: "#2563EB",
  pink: "#EC4899",
  red: "#EF4444",
  orange: "#F97316",
  gold: "#F59E0B",
  green: "#22C55E",
};

const OZAGU_LIGHT = {
  background: "#FAFAF8",
  surface: "#FFFFFF",
  surface2: "#F2F2EF",
  border: "#E5E5E0",
  white: "#1A1A1A",
  muted: "#6B6B6B",
  violet: "#7C3AED",
  purple: "#A855F7",
  blue: "#2563EB",
  pink: "#EC4899",
  red: "#EF4444",
  orange: "#F97316",
  gold: "#F59E0B",
  green: "#22C55E",
};

const ThemeContext = React.createContext({
  theme: OZAGU,
  isDark: true,
  toggle: () => {},
});

export const useTheme = () => React.useContext(ThemeContext);
const AVATARS = {
  alex: "https://i.pravatar.cc/300?img=12",
  maya: "https://i.pravatar.cc/300?img=47",
  david: "https://i.pravatar.cc/300?img=11",
  nina: "https://i.pravatar.cc/300?img=32",
  john: "https://i.pravatar.cc/300?img=13",
  user: "https://i.pravatar.cc/300?img=68",
};

const DEMO_IMAGES = {
  city: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200",
  nature:
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200",
  car: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
  ocean:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
  food:
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200",
};

const STORIES = [
  { id: "s0", name: "Your story", avatar: AVATARS.user, own: true },
  { id: "s1", name: "Maya", avatar: AVATARS.maya },
  { id: "s2", name: "David", avatar: AVATARS.david },
  { id: "s3", name: "Nina", avatar: AVATARS.nina },
  { id: "s4", name: "Alex", avatar: AVATARS.alex },
  { id: "s5", name: "John", avatar: AVATARS.john },
];

const INITIAL_TV = [
  {
    id: "tv1",
    author: "Maya Johnson",
    username: "maya.j",
    avatar: AVATARS.maya,
    verified: true,
    title: "City nights ✨",
    caption: "The city never sleeps.",
    image: DEMO_IMAGES.city,
    likes: 1240,
    comments: 86,
    shares: 42,
    saves: 112,
    following: false,
    liked: false,
    saved: false,
    reposted: false,
    sound: true,
  },
  {
    id: "tv2",
    author: "David Carter",
    username: "david.c",
    avatar: AVATARS.david,
    verified: false,
    title: "Weekend escape",
    caption: "Nature always finds a way to reset the mind.",
    image: DEMO_IMAGES.nature,
    likes: 894,
    comments: 51,
    shares: 27,
    saves: 73,
    following: false,
    liked: false,
    saved: false,
    reposted: false,
    sound: true,
  },
  {
    id: "tv3",
    author: "Nina Williams",
    username: "nina.w",
    avatar: AVATARS.nina,
    verified: true,
    title: "Good food, good mood 🍜",
    caption: "What would you order?",
    image: DEMO_IMAGES.food,
    likes: 2180,
    comments: 142,
    shares: 88,
    saves: 190,
    following: true,
    liked: false,
    saved: false,
    reposted: false,
    sound: true,
  },
];



// ── SUPABASE: fetch real posts (post + author profile + attached media) ──
async function fetchPosts(currentUserId) {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      id, content, likes_count, comments_count, shares_count, created_at, user_id,
      profiles:user_id ( username, display_name, avatar_url, is_verified ),
      media ( media_url, media_type )
    `)
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const postIds = posts.map((p) => p.id);

  const { data: userLikes } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", currentUserId)
    .in(
      "post_id",
      postIds.length ? postIds : ["00000000-0000-0000-0000-000000000000"]
    );

  const likedSet = new Set((userLikes || []).map((l) => l.post_id));

  return posts.map((p) => ({
    id: p.id,
    author: p.profiles?.display_name || "OZAGU User",
    username: p.profiles?.username || "user",
    avatar: p.profiles?.avatar_url || AVATARS.user,
    verified: p.profiles?.is_verified || false,
    text: p.content,
    images: (p.media || []).map((m) => m.media_url),
    likes: p.likes_count,
    comments: p.comments_count,
    shares: p.shares_count,
    saved: false,
    liked: likedSet.has(p.id),
    following: false,
    public: true,
  }));
}

function Avatar({ uri, size = 44, border = false }) {
  return (
    <View
      style={[
        styles.avatarOuter,
        {
          width: size + (border ? 4 : 0),
          height: size + (border ? 4 : 0),
          borderRadius: (size + (border ? 4 : 0)) / 2,
        },
        border && styles.avatarBorder,
      ]}
    >
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    </View>
  );
}

function IconButton({ label, icon, ionicon, onPress, active = false, size = 42, iconSize }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.iconButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        active && styles.iconButtonActive,
      ]}
    >
      {ionicon ? (
        <Ionicons
          name={ionicon}
          size={iconSize || Math.round(size * 0.48)}
          color={OZAGU.white}
        />
      ) : (
        <Text style={[styles.iconText, active && styles.iconTextActive]}>
          {icon}
        </Text>
      )}
    </Pressable>
  );
}

function TopHeader({
  title = "OZAGU",
  onSearch,
  onAI,
  navigate,
}) {
  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: 18,
          paddingBottom: 12,
        },
      ]}
    >
      {/* ROW 1 — OZAGU */}
      <View
        style={{
          width: "100%",
          alignItems: "flex-start",
        }}
      >
        <Text style={styles.logo}>{title}</Text>
      </View>

      {/* ROW 2 — ALERTS / MARKET / ME */}
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        {/* ALERTS */}
        <Pressable
          onPress={() => ozaguNavigate?.("alerts")}
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 14,
          }}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={OZAGU.gold}
          />

          <Text
            style={{
              color: OZAGU.white,
              fontSize: 9,
              marginTop: 2,
            }}
          >
            Alerts
          </Text>
        </Pressable>

        {/* MARKET */}
        <Pressable
          onPress={() => navigate?.("market")}
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 18,
          }}
        >
          <Ionicons
            name="storefront-outline"
            size={24}
            color={OZAGU.white}
          />

          <Text
            style={{
              color: OZAGU.white,
              fontSize: 9,
              marginTop: 2,
            }}
          >
            Market
          </Text>
        </Pressable>

        {/* ME */}
        <Pressable
          onPress={() => navigate?.("me")}
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 18,
          }}
        >
          <Avatar
            uri={AVATARS.user}
            size={27}
          />

          <Text
            style={{
              color: OZAGU.white,
              fontSize: 9,
              marginTop: 2,
            }}
          >
            ME
          </Text>
        </Pressable>
      </View>

      {/* ROW 3 — ASK BETA AI */}
      <Pressable
        onPress={onAI}
        style={{
          width: "100%",
          height: 42,
          borderRadius: 21,
          backgroundColor: OZAGU.surface2,
          justifyContent: "center",
          paddingHorizontal: 15,
          marginTop: 13,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: OZAGU.white,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            Ask Beta AI anything
          </Text>

          <Text
            style={{
              color: "#A855F7",
              fontSize: 19,
              marginLeft: 6,
            }}
          >
            ✦
          </Text>
        </View>
      </Pressable>

      {/* ROW 4 — SEARCH */}
      <View
        style={{
          width: "100%",
          alignItems: "flex-end",
          marginTop: 8,
        }}
      >
        <IconButton
          label="Search"
          ionicon="search-outline"
          onPress={onSearch}
        />
      </View>
    </View>
  );
}

function StoryBar({ onOpenStory, stories = STORIES }) {
  return (
    <View style={styles.storySection}>
      <Text style={styles.sectionTitle}>Stories</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storyScroll}
      >
        {stories.map((story) => (
          <Pressable
            key={story.id}
            style={styles.storyItem}
            onPress={() => onOpenStory(story)}
          >
            <View style={styles.storyRing}>
              <Avatar uri={story.avatar} size={60} />
            </View>

            <Text numberOfLines={1} style={styles.storyName}>
              {story.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function HomePost({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onProfile,
  onMore,
  onFollow,
}) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Pressable
          style={styles.postUser}
          onPress={() => onProfile(post)}
        >
          <Avatar uri={post.avatar} size={44} />

          <View style={styles.postUserText}>
            <View style={styles.nameRow}>
              <Text style={styles.postAuthor}>{post.author}</Text>
              {post.verified && <Text style={styles.verified}>✓</Text>}
            </View>

            <Text style={styles.username}>@{post.username}</Text>
          </View>
        </Pressable>

        <View style={styles.postHeaderRight}>
          {!post.following && (
            <Pressable
              style={styles.smallFollow}
              onPress={() => onFollow(post)}
            >
              <Text style={styles.smallFollowText}>Follow</Text>
            </Pressable>
          )}

          <IconButton
            label="More"
            ionicon="ellipsis-horizontal"
            size={38}
            onPress={() => onMore(post)}
          />
        </View>
      </View>

      {post.text ? <Text style={styles.postText}>{post.text}</Text> : null}

      {post.images && post.images.length > 0 && (
        <ScrollView
          horizontal={post.images.length > 1}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.postImages}
        >
          {post.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={[
                styles.postImage,
                post.images.length > 1 && {
                  width: SCREEN_WIDTH - 32,
                },
              ]}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.postStats}>
        <Text style={styles.statText}>{post.likes} likes</Text>
        <Text style={styles.statText}>{post.comments} comments</Text>
        <Text style={styles.statText}>{post.shares} shares</Text>
      </View>

      <View style={styles.postActions}>
        <Pressable style={styles.postAction} onPress={() => onLike(post)}>
          <Ionicons
            name={post.liked ? "heart" : "heart-outline"}
            size={20}
            color={post.liked ? OZAGU.red : OZAGU.white}
          />
          <Text style={styles.actionText}>Like</Text>
        </Pressable>

        <Pressable
          style={styles.postAction}
          onPress={() => onComment(post)}
        >
          <Ionicons name="chatbubble-outline" size={19} color={OZAGU.white} />
          <Text style={styles.actionText}>Comment</Text>
        </Pressable>

        <Pressable style={styles.postAction} onPress={() => onShare(post)}>
          <Ionicons name="arrow-redo-outline" size={19} color={OZAGU.white} />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>

        <Pressable style={styles.postAction} onPress={() => onSave(post)}>
          <Ionicons
            name={post.saved ? "bookmark" : "bookmark-outline"}
            size={19}
            color={post.saved ? OZAGU.gold : OZAGU.white}
          />
          <Text style={styles.actionText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HomeScreen({ posts, setPosts, openModal, navigate }) {
  const [myAvatar, setMyAvatar] = useState(AVATARS.user);

  useEffect(() => {
    const loadMyAvatar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (data?.avatar_url) setMyAvatar(data.avatar_url);
    };

    loadMyAvatar();
  }, []);

  const storiesForDisplay = STORIES.map((s) =>
    s.id === "s0" ? { ...s, avatar: myAvatar } : s
  );

  const updatePost = (id, updater) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? updater(post) : post))
    );
  };

  const likePost = async (post) => {
    const wasLiked = post.liked;

    // optimistic UI update
    updatePost(post.id, (p) => ({
      ...p,
      liked: !p.liked,
      likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1,
    }));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (wasLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", post.id);

      if (error) {
        // revert on failure
        updatePost(post.id, (p) => ({
          ...p,
          liked: true,
          likes: p.likes + 1,
        }));
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: user.id, post_id: post.id });

      if (error) {
        updatePost(post.id, (p) => ({
          ...p,
          liked: false,
          likes: Math.max(0, p.likes - 1),
        }));
      }
    }
  };

  const savePost = (post) => {
    updatePost(post.id, (p) => ({
      ...p,
      saved: !p.saved,
    }));
  };

  const followPost = (post) => {
    updatePost(post.id, (p) => ({
      ...p,
      following: !p.following,
    }));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopHeader
        onSearch={() => openModal("search")}
        onAI={() => openModal("ai")}
        navigate={navigate}
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <StoryBar
            stories={storiesForDisplay}
            onOpenStory={(story) => openModal("story", story)}
          />
        }
        ListEmptyComponent={
          <View style={{ padding: 30, alignItems: "center" }}>
            <Text style={{ color: OZAGU.muted, fontSize: 13 }}>
              No posts yet. Be the first to post!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <HomePost
            post={item}
            onLike={likePost}
            onComment={(p) => openModal("comments", p)}
            onShare={(p) => openModal("share", p)}
            onSave={savePost}
            onProfile={(p) => openModal("profile", p)}
            onMore={(p) => openModal("postMenu", p)}
            onFollow={followPost}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      />
    </SafeAreaView>
  );
}

function TVAction({ ionicon, label, onPress, active = false }) {
  return (
    <Pressable style={styles.tvAction} onPress={onPress}>
      <Ionicons
        name={ionicon}
        size={26}
        color={active ? OZAGU.pink : OZAGU.white}
      />
      <Text style={styles.tvActionLabel}>{label}</Text>
    </Pressable>
  );
}

function TVCard({
  item,
  index,
  onAction,
  onProfile,
  onHeartAvatar,
  onFollow,
}) {
  return (
    <View style={styles.tvCard}>
      <Image source={{ uri: item.image }} style={styles.tvImage} />

      <LinearGradient
  colors={["transparent", "transparent", "rgba(0,0,0,0.85)"]}
  locations={[0, 0.55, 1]}
  style={StyleSheet.absoluteFill}
  pointerEvents="none"
/>

      <View style={styles.tvTop}>
        <Text style={styles.tvIndex}>
          {index + 1}
        </Text>

        <IconButton
          label="Search TV"
          ionicon="search-outline"
          onPress={() => onAction(item, "search")}
        />
      </View>

      <View style={styles.tvBottom}>
        <View style={styles.tvInfo}>
          <Pressable
            style={styles.tvAuthorRow}
            onPress={() => onProfile(item)}
          >
            <Pressable onPress={onHeartAvatar}>
              <Avatar uri={item.avatar} size={48} border />
            </Pressable>

            <View style={styles.tvAuthorInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.tvAuthor}>{item.author}</Text>
                {item.verified && <Text style={styles.verified}>✓</Text>}
              </View>

              <Text style={styles.tvUsername}>@{item.username}</Text>
            </View>

            <Pressable
              style={[
                styles.followButton,
                item.following && styles.followingButton,
              ]}
              onPress={onFollow}
            >
              <Text
                style={[
                  styles.followButtonText,
                  item.following && styles.followingButtonText,
                ]}
              >
                {item.following ? "Following" : "Follow"}
              </Text>
            </Pressable>
          </Pressable>

          <Text style={styles.tvTitle}>{item.title}</Text>
          <Text style={styles.tvCaption}>{item.caption}</Text>

          <Pressable
            style={styles.soundRow}
            onPress={() => onAction(item, "sound")}
          >
            <Ionicons
              name={item.sound ? "volume-high-outline" : "volume-mute-outline"}
              size={15}
              color={OZAGU.white}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.soundText}>
              {item.sound ? "Original sound" : "Muted"} · {item.author}
            </Text>
          </Pressable>
        </View>

        <View style={styles.tvActions}>
          <TVAction
            ionicon={item.liked ? "heart" : "heart-outline"}
            label={String(item.likes)}
            active={item.liked}
            onPress={() => onAction(item, "like")}
          />

          <TVAction
            ionicon="chatbubble-outline"
            label={String(item.comments)}
            onPress={() => onAction(item, "comments")}
          />

          <TVAction
            ionicon="arrow-redo-outline"
            label={String(item.shares)}
            onPress={() => onAction(item, "share")}
          />

          <TVAction
            ionicon={item.saved ? "bookmark" : "bookmark-outline"}
            label={String(item.saves)}
            active={item.saved}
            onPress={() => onAction(item, "save")}
          />

          <TVAction
            ionicon="repeat"
            label="Repost"
            active={item.reposted}
            onPress={() => onAction(item, "repost")}
          />

          <TVAction
            ionicon="ellipsis-horizontal"
            label="More"
            onPress={() => onAction(item, "more")}
          />
        </View>
      </View>
    </View>
  );
}

function TVScreen({ tvItems, setTvItems, openModal }) {
  const toggleItem = (id, changes) => {
    setTvItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...changes } : item
      )
    );
  };

  const handleAction = (item, action) => {
    if (action === "like") {
      toggleItem(item.id, {
        liked: !item.liked,
        likes: item.liked
          ? Math.max(0, item.likes - 1)
          : item.likes + 1,
      });
      return;
    }

    if (action === "save") {
      toggleItem(item.id, {
        saved: !item.saved,
        saves: item.saved
          ? Math.max(0, item.saves - 1)
          : item.saves + 1,
      });
      return;
    }

    if (action === "repost") {
      toggleItem(item.id, {
        reposted: !item.reposted,
      });
      return;
    }

    if (action === "sound") {
      toggleItem(item.id, {
        sound: !item.sound,
      });
      return;
    }

    if (action === "comments") {
      openModal("comments", item);
      return;
    }

    if (action === "share") {
      openModal("share", item);
      return;
    }

    if (action === "more") {
      openModal("tvMenu", item);
      return;
    }

    if (action === "search") {
      openModal("search");
    }
  };

  const toggleFollow = (id) => {
    setTvItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, following: !item.following }
          : item
      )
    );
  };

  return (
    <SafeAreaView style={styles.tvScreen}>
      <FlatList
        data={tvItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TVCard
            item={item}
            index={index}
            onAction={handleAction}
            onProfile={(p) => openModal("profile", p)}
            onHeartAvatar={() => {
              Alert.alert("OZAGU", "You liked this creator's profile.");
            }}
            onFollow={() => toggleFollow(item.id)}
          />
        )}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT - 24,
          offset: (SCREEN_HEIGHT - 24) * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

function KeySetupScreen({ onComplete }) {
  const { theme } = useTheme();
  const [stage, setStage] = useState("pin"); // pin | confirm | email | saving
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const handlePinInput = (digit) => {
    setError("");
    if (stage === "pin") {
      const next = pin + digit;
      if (next.length <= 6) setPin(next);
      if (next.length === 6) setTimeout(() => setStage("confirm"), 200);
    } else if (stage === "confirm") {
      const next = confirmPin + digit;
      if (next.length <= 6) setConfirmPin(next);
      if (next.length === 6) {
        setTimeout(() => {
          if (next === pin) setStage("email");
          else {
            setError("PINs don't match. Try again.");
            setPin("");
            setConfirmPin("");
            setStage("pin");
          }
        }, 200);
      }
    }
  };

  const handleBackspace = () => {
    setError("");
    if (stage === "pin") setPin((p) => p.slice(0, -1));
    else if (stage === "confirm") setConfirmPin((p) => p.slice(0, -1));
  };

  const createKeys = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not signed in.");

      const {
        generateIdentityKeyPair,
        generateSalt,
        wrapKeyWithPin,
        generateRecoveryCode,
        cachePrivateKey,
      } = require("./crypto");

      // 1. Generate identity keys
      const { publicKeyBase64, privateKeyPkcs8Base64 } =
        await generateIdentityKeyPair();

      // 2. PIN salt + wrap
      const pinSalt = generateSalt();
      const wrapped = await wrapKeyWithPin(privateKeyPkcs8Base64, pin, pinSalt);

      // 3. Recovery code — will be emailed later
      const recoveryCode = generateRecoveryCode();
      const recSalt = generateSalt();
      const recoveryWrapped = await wrapKeyWithPin(
        privateKeyPkcs8Base64,
        recoveryCode,
        recSalt
      );

      // 4. Save to user_keys
      const { error: dbError } = await supabase
  .from("user_keys")
  .upsert(
    {
      user_id: user.id,
      email: user.email,
      public_key: publicKeyBase64,
      pin_wrapped_key: JSON.stringify(wrapped),
      pin_salt: pinSalt,
      recovery_email_code_hash: JSON.stringify({
        wrapped: recoveryWrapped,
        salt: recSalt,
      }),
    },
    { onConflict: "user_id" }
  );

      if (dbError) throw dbError;

      // 5. Cache the unlocked private key for this session
      await cachePrivateKey(privateKeyPkcs8Base64);

      // 6. Trigger recovery email (best-effort)
      try {
        await supabase.functions.invoke("send_recovery_email", {
          body: {
            user_id: user.id,
            email: email.trim(),
            recovery_code: recoveryCode,
          },
        });
      } catch (e) {
        console.log("Recovery email will be sent later:", e?.message);
      }

      setStage("saving");
      setTimeout(() => onComplete(), 1500);
    } catch (err) {
      setError(err?.message || "Something went wrong. Try again.");
      setCreating(false);
    }
  };

  // ============================================================
  // RENDER — PIN entry stages
  // ============================================================

  if (stage === "pin" || stage === "confirm") {
    const current = stage === "pin" ? pin : confirmPin;
    const title = stage === "pin" ? "Create your PIN" : "Confirm your PIN";
    const subtitle =
      stage === "pin"
        ? "Pick 6 digits. This unlocks your encrypted chats."
        : "Enter the same 6 digits again.";

    return (
      <SafeAreaView style={styles.screen}>
        <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
          <Text
            style={{
              color: OZAGU.white,
              fontSize: 26,
              fontWeight: "800",
              textAlign: "center",
              fontFamily: "SpaceGrotesk-Bold",
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: OZAGU.muted,
              fontSize: 13,
              textAlign: "center",
              marginTop: 8,
              marginBottom: 30,
            }}
          >
            {subtitle}
          </Text>

          {/* PIN dots */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 16,
              marginBottom: 30,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: OZAGU.purple,
                  backgroundColor:
                    i < current.length ? OZAGU.purple : "transparent",
                }}
              />
            ))}
          </View>

          {error ? (
            <Text
              style={{
                color: OZAGU.red,
                textAlign: "center",
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              {error}
            </Text>
          ) : null}

          {/* Number pad */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 14,
            }}
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <Pressable
                key={d}
                onPress={() => handlePinInput(d)}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: OZAGU.surface2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: OZAGU.white,
                    fontSize: 26,
                    fontWeight: "600",
                  }}
                >
                  {d}
                </Text>
              </Pressable>
            ))}

            <View style={{ width: 72, height: 72 }} />

            <Pressable
              onPress={() => handlePinInput("0")}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: OZAGU.surface2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: OZAGU.white,
                  fontSize: 26,
                  fontWeight: "600",
                }}
              >
                0
              </Text>
            </Pressable>

            <Pressable
              onPress={handleBackspace}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="backspace-outline" size={28} color={OZAGU.white} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // RENDER — email stage
  // ============================================================

  if (stage === "email") {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
          <Text
            style={{
              color: OZAGU.white,
              fontSize: 26,
              fontWeight: "800",
              fontFamily: "SpaceGrotesk-Bold",
            }}
          >
            Recovery email
          </Text>

          <Text
            style={{
              color: OZAGU.muted,
              fontSize: 13,
              lineHeight: 20,
              marginTop: 10,
              marginBottom: 24,
            }}
          >
            We'll send a recovery code to this email. If you switch phones, you
            can use it to restore access to your encrypted chats.
          </Text>

          <TextInput
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError("");
            }}
            placeholder="you@example.com"
            placeholderTextColor={OZAGU.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.formInput}
          />

          {error ? (
            <Text style={{ color: OZAGU.red, fontSize: 12, marginTop: 4 }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            style={[styles.primaryButton, creating && { opacity: 0.6 }]}
            disabled={creating}
            onPress={createKeys}
          >
            {creating ? (
              <ActivityIndicator color={OZAGU.white} />
            ) : (
              <Text style={styles.primaryButtonText}>
                Create encrypted chat
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================================
  // RENDER — saving stage
  // ============================================================

  return (
    <SafeAreaView style={styles.screen}>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <ActivityIndicator size="large" color={OZAGU.purple} />
        <Text
          style={{
            color: OZAGU.white,
            fontSize: 16,
            fontWeight: "700",
            marginTop: 20,
          }}
        >
          Setting up encryption…
        </Text>
        <Text
          style={{
            color: OZAGU.muted,
            fontSize: 12,
            marginTop: 6,
            textAlign: "center",
          }}
        >
          This only takes a few seconds
        </Text>
      </View>
    </SafeAreaView>
  );
}

function KeyUnlockScreen({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const submitPin = async (fullPin) => {
    setChecking(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not signed in.");

      const { data, error: dbError } = await supabase
        .from("user_keys")
        .select("pin_wrapped_key, pin_salt")
        .eq("user_id", user.id)
        .maybeSingle();

      if (dbError) throw dbError;
      if (!data) throw new Error("No key found. Please log out and set up again.");

      const { unwrapKeyWithPin, cachePrivateKey } = require("./crypto");

      const wrapped = JSON.parse(data.pin_wrapped_key);
      const privateKey = await unwrapKeyWithPin(wrapped, fullPin, data.pin_salt);

      await cachePrivateKey(privateKey);
      onUnlock();
    } catch (err) {
      setError("Wrong PIN. Try again.");
      setPin("");
      setChecking(false);
    }
  };

  const handleDigit = (d) => {
    if (checking) return;
    setError("");
    const next = pin + d;
    if (next.length <= 6) setPin(next);
    if (next.length === 6) setTimeout(() => submitPin(next), 150);
  };

  const handleBackspace = () => {
    if (checking) return;
    setError("");
    setPin((p) => p.slice(0, -1));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <Image
          source={{
            uri: "https://wtfuefyzoopllgmusfbp.supabase.co/storage/v1/object/public/ozagu-media/file_00000000bef0820a8f48b182d2ee6a5e.png",
          }}
          style={{
            width: 90,
            height: 90,
            alignSelf: "center",
            marginBottom: 24,
          }}
          resizeMode="contain"
        />

        <Text
          style={{
            color: OZAGU.white,
            fontSize: 24,
            fontWeight: "800",
            textAlign: "center",
            fontFamily: "SpaceGrotesk-Bold",
          }}
        >
          Unlock OZAGU
        </Text>

        <Text
          style={{
            color: OZAGU.muted,
            fontSize: 13,
            textAlign: "center",
            marginTop: 8,
            marginBottom: 30,
          }}
        >
          Enter your 6-digit PIN
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 16,
            marginBottom: 30,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: OZAGU.purple,
                backgroundColor:
                  i < pin.length ? OZAGU.purple : "transparent",
              }}
            />
          ))}
        </View>

        {error ? (
          <Text
            style={{
              color: OZAGU.red,
              textAlign: "center",
              marginBottom: 16,
              fontSize: 12,
            }}
          >
            {error}
          </Text>
        ) : null}

        {checking ? (
          <ActivityIndicator color={OZAGU.purple} style={{ marginTop: 10 }} />
        ) : null}

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 14,
          }}
        >
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <Pressable
              key={d}
              onPress={() => handleDigit(d)}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: OZAGU.surface2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: OZAGU.white,
                  fontSize: 26,
                  fontWeight: "600",
                }}
              >
                {d}
              </Text>
            </Pressable>
          ))}

          <View style={{ width: 72, height: 72 }} />

          <Pressable
            onPress={() => handleDigit("0")}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: OZAGU.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: OZAGU.white,
                fontSize: 26,
                fontWeight: "600",
              }}
            >
              0
            </Text>
          </Pressable>

          <Pressable
            onPress={handleBackspace}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="backspace-outline" size={28} color={OZAGU.white} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function useStreamClient(session) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!session?.user?.id) return;

      setLoading(true);
      setError("");

      try {
        const { data, error: fnErr } = await supabase.functions.invoke(
          "stream_token",
          { body: {} }
        );

        if (fnErr) throw fnErr;
        if (!data?.token || !data?.api_key) {
          throw new Error("Stream token missing");
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, username, avatar_url")
          .eq("id", session.user.id)
          .maybeSingle();

        const user = {
          id: session.user.id,
          name:
            profile?.display_name ||
            profile?.username ||
            "OZAGU User",
          image: profile?.avatar_url || undefined,
        };

        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey: data.api_key,
          user,
          token: data.token,
        });

        if (mounted) setClient(streamClient);
      } catch (err) {
        if (mounted) setError(err?.message || "Could not connect to Stream");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
      if (client) client.disconnectUser().catch(() => {});
    };
  }, [session?.user?.id]);

  return { client, loading, error };
}

function VideoEditorScreen({ onClose, onPost }) {
  const [videoUri, setVideoUri] = useState(null);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [text, setText] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [musicUri, setMusicUri] = useState(null);
  const [musicName, setMusicName] = useState("");
  const [speed, setSpeed] = useState(1);
  const [filter, setFilter] = useState("none");
  const [activePanel, setActivePanel] = useState("tools");
  const [playing, setPlaying] = useState(false);

  const videoRef = React.useRef(null);
  const soundRef = React.useRef(null);

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow gallery access to pick a video.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setVideoUri(asset.uri);
    const dur = Math.floor((asset.duration || 15000) / 1000);
    setDuration(dur);
    setTrimStart(0);
    setTrimEnd(dur);
  };

  const pickMusic = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Audio,
      allowsEditing: false,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setMusicUri(asset.uri);
    setMusicName(asset.fileName || "Audio track");
  };

  const playPreview = async () => {
    if (!videoRef.current) return;
    try {
      if (playing) {
        await videoRef.current.pauseAsync();
        if (soundRef.current) await soundRef.current.pauseAsync();
        setPlaying(false);
      } else {
        await videoRef.current.playAsync();
        if (soundRef.current) await soundRef.current.playAsync();
        setPlaying(true);
      }
    } catch {}
  };

  const applyFilter = (name) => {
    setFilter(name);
    // Real filter application happens on export (native).
    // This just tracks the choice.
  };

  const saveVideo = async () => {
    if (!videoUri) {
      Alert.alert("No video", "Pick a video first.");
      return;
    }

    Alert.alert(
      "Editor",
      "Full video processing (trim, filter, text overlay, speed) requires the native FFmpeg module. This will be wired up in the dev build. For now, we'll post the original video with your text and settings recorded.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            onPost?.({
              uri: videoUri,
              text,
              musicUri,
              musicName,
              speed,
              filter,
              trimStart,
              trimEnd,
            });
          },
        },
      ]
    );
  };

  if (!videoUri) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              borderBottomWidth: 1,
              borderBottomColor: OZAGU.border,
            }}
          >
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={26} color={OZAGU.white} />
            </Pressable>
            <Text
              style={{
                color: OZAGU.white,
                fontSize: 16,
                fontWeight: "800",
                marginLeft: 14,
                flex: 1,
                fontFamily: "SpaceGrotesk-Bold",
              }}
            >
              Create
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 30,
            }}
          >
            <Ionicons
              name="videocam-outline"
              size={64}
              color={OZAGU.purple}
            />
            <Text
              style={{
                color: OZAGU.white,
                fontSize: 18,
                fontWeight: "800",
                marginTop: 20,
                fontFamily: "SpaceGrotesk-Bold",
              }}
            >
              Start a new video
            </Text>
            <Text
              style={{
                color: OZAGU.muted,
                fontSize: 13,
                textAlign: "center",
                marginTop: 8,
                marginBottom: 28,
              }}
            >
              Trim, add music, text, filters, speed and more
            </Text>

            <Pressable
              onPress={pickVideo}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 28,
                backgroundColor: OZAGU.violet,
              }}
            >
              <Ionicons name="film-outline" size={20} color={OZAGU.white} />
              <Text
                style={{ color: OZAGU.white, fontWeight: "800", fontSize: 15 }}
              >
                Pick from gallery
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={{ flex: 1 }}>
        {/* TOP BAR */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 14,
            borderBottomWidth: 1,
            borderBottomColor: OZAGU.border,
          }}
        >
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={OZAGU.white} />
          </Pressable>
          <Text
            style={{
              color: OZAGU.white,
              fontSize: 15,
              fontWeight: "800",
              marginLeft: 14,
              flex: 1,
            }}
          >
            Edit
          </Text>
          <Pressable
            onPress={saveVideo}
            style={{
              backgroundColor: OZAGU.red,
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text
              style={{ color: OZAGU.white, fontWeight: "800", fontSize: 13 }}
            >
              Next
            </Text>
          </Pressable>
        </View>

        {/* PREVIEW */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {React.createElement(require("expo-video").VideoView, {
            player: (() => {
              const player = require("expo-video").useVideoPlayer?.(videoUri);
              return player;
            })(),
            style: { width: "100%", height: "100%" },
            contentFit: "contain",
            nativeControls: false,
          })}

          {/* Text overlay */}
          {text ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: `${textPosition.x}%`,
                top: `${textPosition.y}%`,
                transform: [{ translateX: -60 }, { translateY: -12 }],
                maxWidth: 200,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: "900",
                  textShadowColor: "#000",
                  textShadowRadius: 6,
                  textAlign: "center",
                }}
              >
                {text}
              </Text>
            </View>
          ) : null}

          {/* Filter overlay (visual only) */}
          {filter === "bw" ? (
            <View
              pointerEvents="none"
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "rgba(0,0,0,0.35)",
                mixBlendMode: "saturation",
              }}
            />
          ) : null}
          {filter === "warm" ? (
            <View
              pointerEvents="none"
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "rgba(255,140,0,0.18)",
              }}
            />
          ) : null}
          {filter === "cool" ? (
            <View
              pointerEvents="none"
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "rgba(80,160,255,0.18)",
              }}
            />
          ) : null}

          {/* Play button */}
          <Pressable
            onPress={playPreview}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginLeft: -30,
              marginTop: -30,
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "rgba(0,0,0,0.55)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={playing ? "pause" : "play"}
              size={28}
              color={OZAGU.white}
            />
          </Pressable>
        </View>

        {/* TRIM BAR */}
        {activePanel === "trim" ? (
          <View style={{ padding: 14, backgroundColor: OZAGU.surface }}>
            <Text
              style={{ color: OZAGU.white, fontWeight: "700", marginBottom: 8 }}
            >
              Trim
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: OZAGU.muted, fontSize: 11 }}>
                  Start: {trimStart}s
                </Text>
                <View
                  style={{
                    height: 8,
                    backgroundColor: OZAGU.surface2,
                    borderRadius: 4,
                    marginTop: 8,
                  }}
                >
                  <View
                    style={{
                      width: `${(trimStart / duration) * 100}%`,
                      height: 8,
                      backgroundColor: OZAGU.violet,
                      borderRadius: 4,
                    }}
                  />
                </View>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <Pressable
                    onPress={() => setTrimStart(Math.max(0, trimStart - 1))}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: OZAGU.surface2,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: OZAGU.white }}>−</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      setTrimStart(Math.min(trimEnd - 1, trimStart + 1))
                    }
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: OZAGU.surface2,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: OZAGU.white }}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: OZAGU.muted, fontSize: 11 }}>
                  End: {trimEnd}s
                </Text>
                <View
                  style={{
                    height: 8,
                    backgroundColor: OZAGU.surface2,
                    borderRadius: 4,
                    marginTop: 8,
                  }}
                >
                  <View
                    style={{
                      width: `${(trimEnd / duration) * 100}%`,
                      height: 8,
                      backgroundColor: OZAGU.purple,
                      borderRadius: 4,
                    }}
                  />
                </View>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <Pressable
                    onPress={() =>
                      setTrimEnd(Math.max(trimStart + 1, trimEnd - 1))
                    }
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: OZAGU.surface2,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: OZAGU.white }}>−</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setTrimEnd(Math.min(duration, trimEnd + 1))}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: OZAGU.surface2,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: OZAGU.white }}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* TEXT PANEL */}
        {activePanel === "text" ? (
          <View style={{ padding: 14, backgroundColor: OZAGU.surface }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type something…"
              placeholderTextColor={OZAGU.muted}
              style={{
                backgroundColor: OZAGU.surface2,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
                color: OZAGU.white,
                fontSize: 14,
              }}
            />
          </View>
        ) : null}

        {/* MUSIC PANEL */}
        {activePanel === "music" ? (
          <View style={{ padding: 14, backgroundColor: OZAGU.surface }}>
            <Pressable
              onPress={pickMusic}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                backgroundColor: OZAGU.surface2,
                borderRadius: 12,
              }}
            >
              <Ionicons name="musical-notes" size={22} color={OZAGU.purple} />
              <Text style={{ color: OZAGU.white, flex: 1 }}>
                {musicName || "Add sound"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={OZAGU.muted}
              />
            </Pressable>
          </View>
        ) : null}

        {/* FILTERS PANEL */}
        {activePanel === "filters" ? (
          <View style={{ padding: 14, backgroundColor: OZAGU.surface }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {[
                  { key: "none", label: "Original" },
                  { key: "bw", label: "B&W" },
                  { key: "warm", label: "Warm" },
                  { key: "cool", label: "Cool" },
                ].map((f) => (
                  <Pressable
                    key={f.key}
                    onPress={() => applyFilter(f.key)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor:
                        filter === f.key ? OZAGU.violet : OZAGU.surface2,
                    }}
                  >
                    <Text style={{ color: OZAGU.white, fontSize: 12 }}>
                      {f.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : null}

        {/* SPEED PANEL */}
        {activePanel === "speed" ? (
          <View style={{ padding: 14, backgroundColor: OZAGU.surface }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[0.5, 1, 1.5, 2, 3].map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSpeed(s)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor:
                      speed === s ? OZAGU.violet : OZAGU.surface2,
                  }}
                >
                  <Text style={{ color: OZAGU.white, fontSize: 13 }}>
                    {s}x
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* BOTTOM TOOLBAR */}
        <View
          style={{
            flexDirection: "row",
            borderTopWidth: 1,
            borderTopColor: OZAGU.border,
            backgroundColor: OZAGU.background,
            paddingVertical: 10,
          }}
        >
          {[
            { key: "trim", icon: "cut-outline", label: "Trim" },
            { key: "text", icon: "text-outline", label: "Text" },
            { key: "music", icon: "musical-notes-outline", label: "Sound" },
            { key: "filters", icon: "color-filter-outline", label: "Filters" },
            { key: "speed", icon: "speedometer-outline", label: "Speed" },
          ].map((t) => (
            <Pressable
              key={t.key}
              onPress={() =>
                setActivePanel(activePanel === t.key ? "tools" : t.key)
              }
              style={{ flex: 1, alignItems: "center", paddingVertical: 6 }}
            >
              <Ionicons
                name={t.icon}
                size={22}
                color={activePanel === t.key ? OZAGU.violet : OZAGU.white}
              />
              <Text
                style={{
                  color:
                    activePanel === t.key ? OZAGU.violet : OZAGU.muted,
                  fontSize: 10,
                  marginTop: 4,
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

function NewChatOptions({ close, openModal }) {
  return (
    <View style={{ padding: 18 }}>
      <Pressable
        onPress={() => {
          close();
          setTimeout(() => openModal("createGroup"), 250);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: OZAGU.border,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: OZAGU.violet,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="people" size={22} color={OZAGU.white} />
        </View>
        <Text
          style={{
            color: OZAGU.white,
            fontSize: 15,
            fontWeight: "700",
            marginLeft: 14,
            flex: 1,
          }}
        >
          New group
        </Text>
        <Ionicons name="chevron-forward" size={18} color={OZAGU.muted} />
      </Pressable>

      <Pressable
        onPress={() => {
          close();
          setTimeout(() => openModal("addContact"), 250);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: OZAGU.border,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: OZAGU.green,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person-add" size={22} color={OZAGU.white} />
        </View>
        <Text
          style={{
            color: OZAGU.white,
            fontSize: 15,
            fontWeight: "700",
            marginLeft: 14,
            flex: 1,
          }}
        >
          New contact
        </Text>
        <Ionicons name="chevron-forward" size={18} color={OZAGU.muted} />
      </Pressable>

      <Pressable
        onPress={() => {
          close();
          Alert.alert(
            "Coming soon",
            "Communities will be available in a future update."
          );
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: OZAGU.border,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: OZAGU.blue,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="globe" size={22} color={OZAGU.white} />
        </View>
        <Text
          style={{
            color: OZAGU.white,
            fontSize: 15,
            fontWeight: "700",
            marginLeft: 14,
            flex: 1,
          }}
        >
          New community
        </Text>
        <Ionicons name="chevron-forward" size={18} color={OZAGU.muted} />
      </Pressable>

      <Pressable
        onPress={() => {
          close();
          setTimeout(() => openModal("newChat"), 250);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: OZAGU.orange,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="search" size={22} color={OZAGU.white} />
        </View>
        <Text
          style={{
            color: OZAGU.white,
            fontSize: 15,
            fontWeight: "700",
            marginLeft: 14,
            flex: 1,
          }}
        >
          Search OZAGU users
        </Text>
        <Ionicons name="chevron-forward" size={18} color={OZAGU.muted} />
      </Pressable>
    </View>
  );
}

function CreateGroupScreen({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setMyId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .neq("id", user.id)
        .order("display_name", { ascending: true })
        .limit(100);

      setUsers(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.username || "").toLowerCase().includes(q) ||
        (u.display_name || "").toLowerCase().includes(q)
    );
  }, [search, users]);

  const create = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Enter a group name.");
      return;
    }
    if (selected.length < 1) {
      Alert.alert("Add members", "Pick at least one person.");
      return;
    }

    setCreating(true);
    try {
      const {
        generateGroupSenderKey,
        encryptGroupKeyForMember,
        deriveSharedKey,
        getCachedPrivateKey,
      } = require("./crypto");

      const { data: group, error: gErr } = await supabase
        .from("group_chats")
        .insert({ name: name.trim(), created_by: myId })
        .select("id, name")
        .single();

      if (gErr) throw gErr;

      const groupKeyBase64 = await generateGroupSenderKey();
      const allMemberIds = [myId, ...selected];

      const { data: pubKeys } = await supabase
        .from("user_public_keys")
        .select("user_id, public_key")
        .in("user_id", allMemberIds);

      if (!pubKeys || pubKeys.length !== allMemberIds.length) {
        throw new Error(
          "One or more members haven't set up encrypted chat yet."
        );
      }

      const myPrivate = await getCachedPrivateKey();
      const rows = [];

      for (const pk of pubKeys) {
        const sharedKey = await deriveSharedKey(myPrivate, pk.public_key);
        const wrapped = await encryptGroupKeyForMember(
          groupKeyBase64,
          sharedKey
        );
        rows.push({
          group_id: group.id,
          user_id: pk.user_id,
          encrypted_group_key: JSON.stringify(wrapped),
        });
      }

      const { error: mErr } = await supabase
        .from("group_members")
        .insert(rows);

      if (mErr) throw mErr;

      onCreated?.({
        id: group.id,
        name: group.name,
        isGroup: true,
      });
    } catch (err) {
      Alert.alert("Create failed", err?.message || "Try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 14,
          borderBottomWidth: 1,
          borderBottomColor: OZAGU.border,
        }}
      >
        <Pressable onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={24} color={OZAGU.white} />
        </Pressable>
        <Text
          style={{
            color: OZAGU.white,
            fontSize: 16,
            fontWeight: "800",
            marginLeft: 14,
            flex: 1,
            fontFamily: "SpaceGrotesk-Bold",
          }}
        >
          New group
        </Text>
        <Pressable
          onPress={create}
          disabled={creating}
          style={{
            backgroundColor: OZAGU.violet,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            opacity: creating ? 0.6 : 1,
          }}
        >
          {creating ? (
            <ActivityIndicator size="small" color={OZAGU.white} />
          ) : (
            <Text
              style={{ color: OZAGU.white, fontWeight: "800", fontSize: 13 }}
            >
              Create
            </Text>
          )}
        </Pressable>
      </View>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Group name"
        placeholderTextColor={OZAGU.muted}
        style={{
          margin: 14,
          backgroundColor: OZAGU.surface2,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          color: OZAGU.white,
          fontSize: 15,
        }}
      />

      <View
        style={{
          marginHorizontal: 14,
          marginBottom: 10,
          backgroundColor: OZAGU.surface2,
          borderRadius: 12,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Ionicons name="search-outline" size={18} color={OZAGU.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search users"
          placeholderTextColor={OZAGU.muted}
          style={{
            flex: 1,
            color: OZAGU.white,
            paddingVertical: 10,
            paddingHorizontal: 8,
            fontSize: 14,
          }}
        />
      </View>

      {selected.length > 0 ? (
        <Text
          style={{
            color: OZAGU.muted,
            fontSize: 12,
            paddingHorizontal: 16,
            marginBottom: 6,
          }}
        >
          {selected.length} selected
        </Text>
      ) : null}

      {loading ? (
        <View style={{ padding: 40, alignItems: "center" }}>
          <ActivityIndicator color={OZAGU.purple} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const isSel = selected.includes(item.id);
            return (
              <Pressable
                onPress={() => toggle(item.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: OZAGU.border,
                }}
              >
                <Avatar
                  uri={
                    item.avatar_url || "https://i.pravatar.cc/300?img=68"
                  }
                  size={44}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      color: OZAGU.white,
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                  >
                    {item.display_name || item.username}
                  </Text>
                  <Text style={{ color: OZAGU.muted, fontSize: 11 }}>
                    @{item.username}
                  </Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSel ? OZAGU.violet : OZAGU.muted,
                    backgroundColor: isSel ? OZAGU.violet : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSel ? (
                    <Ionicons name="checkmark" size={14} color={OZAGU.white} />
                  ) : null}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

function GroupChatView({ group, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  const [groupKey, setGroupKey] = useState(null);
  const [error, setError] = useState("");
  const [activeCall, setActiveCall] = useState(null);
  const listRef = React.useRef(null);
  const groupKeyRef = React.useRef(null);

  const loadGroupKey = async () => {
    if (groupKeyRef.current) return groupKeyRef.current;

    const {
      getCachedPrivateKey,
      deriveSharedKey,
      decryptGroupKeyFromMember,
      importGroupKey,
    } = require("./crypto");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in.");

    const { data: myMembership } = await supabase
      .from("group_members")
      .select("encrypted_group_key")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!myMembership?.encrypted_group_key) {
      throw new Error("You don't have access to this group.");
    }

    const { data: groupRow } = await supabase
      .from("group_chats")
      .select("created_by")
      .eq("id", group.id)
      .maybeSingle();

    const creatorId = groupRow?.created_by;
    if (!creatorId) throw new Error("Group creator missing.");

    const { data: creatorKey } = await supabase
      .from("user_public_keys")
      .select("public_key")
      .eq("user_id", creatorId)
      .maybeSingle();

    if (!creatorKey?.public_key) {
      throw new Error("Group key unavailable.");
    }

    const myPrivate = await getCachedPrivateKey();
    const shared = await deriveSharedKey(myPrivate, creatorKey.public_key);
    const wrapped = JSON.parse(myMembership.encrypted_group_key);
    const groupKeyB64 = await decryptGroupKeyFromMember(wrapped, shared);

    const key = await importGroupKey(groupKeyB64);
    groupKeyRef.current = key;
    setGroupKey(key);
    return key;
  };

  const loadMessages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setMyId(user.id);

      const key = await loadGroupKey();

      const { data, error: loadErr } = await supabase
        .from("messages")
        .select("id, sender_id, ciphertext, iv, created_at")
        .eq("group_id", group.id)
        .eq("is_group", true)
        .order("created_at", { ascending: true });

      if (loadErr) throw loadErr;

      const { decryptMessage } = require("./crypto");

      const decrypted = await Promise.all(
        (data || []).map(async (m) => {
          try {
            const plain = await decryptMessage(m.ciphertext, m.iv, key);
            return {
              id: m.id,
              sender_id: m.sender_id,
              text: plain,
              created_at: m.created_at,
            };
          } catch {
            return {
              id: m.id,
              sender_id: m.sender_id,
              text: "[Unable to decrypt]",
              created_at: m.created_at,
            };
          }
        })
      );

      setMessages(decrypted);
    } catch (err) {
      setError(err?.message || "Could not load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`group-${group.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `group_id=eq.${group.id}`,
        },
        async (payload) => {
          const row = payload.new;
          const key = groupKeyRef.current;
          if (!key) return;
          try {
            const { decryptMessage } = require("./crypto");
            const plain = await decryptMessage(row.ciphertext, row.iv, key);
            setMessages((prev) => [
              ...prev,
              {
                id: row.id,
                sender_id: row.sender_id,
                text: plain,
                created_at: row.created_at,
              },
            ]);
          } catch {
            setMessages((prev) => [
              ...prev,
              {
                id: row.id,
                sender_id: row.sender_id,
                text: "[Unable to decrypt]",
                created_at: row.created_at,
              },
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [group.id]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || !groupKey) return;
    setSending(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      const { encryptMessage } = require("./crypto");
      const { ciphertext, iv } = await encryptMessage(trimmed, groupKey);

      const { error: insErr } = await supabase.from("messages").insert({
        group_id: group.id,
        sender_id: user.id,
        ciphertext,
        iv,
        is_group: true,
      });

      if (insErr) throw insErr;
      setText("");
    } catch (err) {
      Alert.alert("Send failed", err?.message || "Try again.");
    } finally {
      setSending(false);
    }
  };

  if (activeCall) {
    return (
      <CallScreen
        mode={activeCall.mode}
        target={{
          id: group.id,
          name: group.name,
          avatar: null,
        }}
        isGroup={true}
        onEnd={() => setActiveCall(null)}
      />
    );
  }

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: "center" }}>
        <ActivityIndicator color={OZAGU.purple} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 30, alignItems: "center" }}>
        <Ionicons name="lock-closed-outline" size={40} color={OZAGU.red} />
        <Text
          style={{ color: OZAGU.white, marginTop: 12, textAlign: "center" }}
        >
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, maxHeight: 560 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
          renderItem={({ item }) => {
            const mine = item.sender_id === myId;
            return (
              <View
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  backgroundColor: mine ? OZAGU.violet : OZAGU.surface2,
                  padding: 11,
                  borderRadius: 16,
                  marginBottom: 8,
                  maxWidth: "80%",
                }}
              >
                <Text
                  style={{
                    color: OZAGU.white,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  {item.text}
                </Text>
                <Text
                  style={{
                    color: mine ? "rgba(255,255,255,0.6)" : OZAGU.muted,
                    fontSize: 9,
                    marginTop: 4,
                    alignSelf: "flex-end",
                  }}
                >
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text
              style={{
                color: OZAGU.muted,
                textAlign: "center",
                marginTop: 40,
                fontSize: 13,
              }}
            >
              Group is empty. Say hi 👋
            </Text>
          }
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 10,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: OZAGU.border,
          }}
        >
          <Pressable
            onPress={() => setActiveCall({ mode: "audio" })}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: OZAGU.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="call-outline" size={20} color={OZAGU.white} />
          </Pressable>
          <Pressable
            onPress={() => setActiveCall({ mode: "video" })}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: OZAGU.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="videocam-outline"
              size={20}
              color={OZAGU.white}
            />
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: OZAGU.border,
            backgroundColor: OZAGU.surface,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor={OZAGU.muted}
            style={{
              flex: 1,
              minHeight: 42,
              maxHeight: 100,
              backgroundColor: OZAGU.surface2,
              borderRadius: 21,
              paddingHorizontal: 16,
              paddingVertical: 10,
              color: OZAGU.white,
              fontSize: 14,
            }}
            multiline
          />
          <Pressable
            onPress={send}
            disabled={sending || !text.trim() || !groupKey}
            style={{
              marginLeft: 8,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: text.trim() ? OZAGU.violet : OZAGU.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color={OZAGU.white} />
            ) : (
              <Ionicons name="send" size={20} color={OZAGU.white} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function ChatScreen({ openModal, onLock }) {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);

  const loadConversations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }
      setMyId(user.id);

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id, user_a, user_b, last_ciphertext, last_iv, last_sender_id, last_message_at,
          profile_a:user_a ( id, username, display_name, avatar_url ),
          profile_b:user_b ( id, username, display_name, avatar_url )
        `)
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      const { getCachedPrivateKey, deriveSharedKey, decryptMessage } = require("./crypto");
      const myPrivate = await getCachedPrivateKey();

      const mapped = await Promise.all(
        (data || []).map(async (c) => {
          const other = c.user_a === user.id ? c.profile_b : c.profile_a;
          const otherId = other?.id;

          let preview = "Tap to start chatting";

          if (c.last_ciphertext && c.last_iv && myPrivate && otherId) {
            try {
              const { data: theirKeyRow } = await supabase
                .from("user_public_keys")
                .select("public_key")
                .eq("user_id", otherId)
                .maybeSingle();

              if (theirKeyRow?.public_key) {
                const shared = await deriveSharedKey(myPrivate, theirKeyRow.public_key);
                const plain = await decryptMessage(c.last_ciphertext, c.last_iv, shared);
                preview = (c.last_sender_id === user.id ? "You: " : "") + plain;
              }
            } catch (e) {
              preview = "[Unable to decrypt]";
            }
          }

          return {
            id: c.id,
            name: other?.display_name || other?.username || "Unknown",
            username: other?.username || "user",
            avatar:
              other?.avatar_url ||
              "https://i.pravatar.cc/300?img=68",
            last: preview,
            time: c.last_message_at
              ? new Date(c.last_message_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            unread: 0,
            otherUserId: otherId,
          };
        })
      );

      setConversations(mapped);
    } catch (error) {
      console.log("loadConversations error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();

    const channel = supabase
      .channel("chat-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => loadConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q)
    );
  }, [search, conversations]);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Custom header with search + lock */}
      <View style={styles.header}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.logo}>Chat</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            

            <Pressable
              onPress={onLock}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: OZAGU.surface2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={OZAGU.purple}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.chatSearch}>
        <Ionicons
          name="search-outline"
          size={20}
          color={theme.muted}
          style={{ marginRight: 7 }}
        />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search chats"
          placeholderTextColor={theme.muted}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator color={OZAGU.purple} />
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={48}
            color={OZAGU.muted}
          />
          <Text
            style={{
              color: OZAGU.muted,
              marginTop: 12,
              textAlign: "center",
              fontSize: 13,
            }}
          >
            No chats yet. Tap the search icon above to find someone.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.pageContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.chatRow}
              onPress={() => openModal("conversation", item)}
            >
              <Avatar uri={item.avatar} size={52} />

              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text
                  numberOfLines={1}
                  style={styles.chatLast}
                >
                  {item.last}
                </Text>
              </View>

              <View style={styles.chatRight}>
                <Text style={styles.chatTime}>{item.time}</Text>
              </View>
            </Pressable>
          )}
             />
      )}

      <Pressable
        onPress={() => openModal("newChatOptions")}
        style={{
          position: "absolute",
          right: 18,
          bottom: 90,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: OZAGU.violet,
          alignItems: "center",
          justifyContent: "center",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          zIndex: 10,
        }}
      >
        <Ionicons name="add" size={30} color={OZAGU.white} />
      </Pressable>

    </SafeAreaView>
  );
}
        
  

function AlertsScreen({ openModal }) {
  const notifications = [
    {
      id: "n1",
      avatar: AVATARS.maya,
      text: "Maya liked your post.",
      time: "2m",
    },
    {
      id: "n2",
      avatar: AVATARS.david,
      text: "David started following you.",
      time: "18m",
    },
    {
      id: "n3",
      avatar: AVATARS.nina,
      text: "Nina mentioned you in a comment.",
      time: "1h",
    },
    {
      id: "n4",
      avatar: AVATARS.alex,
      text: "Alex shared your post.",
      time: "3h",
    },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <TopHeader
        title="Alerts"
        onSearch={() => openModal("search")}
        onAI={() => openModal("ai")}
      />

      <View style={styles.pageHeaderRow}>
        <Text style={styles.pageTitle}>Notifications</Text>

        <Pressable
          style={styles.settingsButton}
          onPress={() => openModal("notificationSettings")}
        >
          <Ionicons name="settings-outline" size={19} color={OZAGU.white} />
        </Pressable>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.pageContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.notificationRow}
            onPress={() => openModal("notification", item)}
          >
            <Avatar uri={item.avatar} size={50} />

            <View style={styles.notificationInfo}>
              <Text style={styles.notificationText}>{item.text}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>

            <Text style={styles.notificationArrow}>›</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function MarketplaceScreen({ openModal }) {
  const categories = [
    "All",
    "Phones",
    "Fashion",
    "Cars",
    "Electronics",
    "Home",
    "Beauty",
  ];

  const products = [
    {
      id: "m1",
      title: "Premium Smartphone",
      price: "₦285,000",
      image: DEMO_IMAGES.city,
      seller: "Tech Hub",
    },
    {
      id: "m2",
      title: "Luxury Car",
      price: "₦12,500,000",
      image: DEMO_IMAGES.car,
      seller: "Auto World",
    },
    {
      id: "m3",
      title: "Modern Home Set",
      price: "₦450,000",
      image: DEMO_IMAGES.nature,
      seller: "Home Store",
    },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <TopHeader
        title="Market"
        onSearch={() => openModal("search")}
        onAI={() => openModal("ai")}
      />

      <View style={styles.marketHeader}>
        <View>
          <Text style={styles.pageTitle}>Marketplace</Text>
          <Text style={styles.pageSubtitle}>
            Buy and sell on OZAGU
          </Text>
        </View>

        <Pressable
          style={styles.sellButton}
          onPress={() => openModal("createListing")}
        >
          <Text style={styles.sellButtonText}>+ Sell</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((category) => (
          <Pressable
            key={category}
            style={styles.categoryPill}
            onPress={() => openModal("category", { category })}
          >
            <Text style={styles.categoryText}>{category}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productColumns}
        contentContainerStyle={styles.marketContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.productCard}
            onPress={() => openModal("product", item)}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.productImage}
            />

            <View style={styles.productInfo}>
              <Text
                numberOfLines={1}
                style={styles.productTitle}
              >
                {item.title}
              </Text>

              <Text style={styles.productPrice}>{item.price}</Text>
              <Text style={styles.productSeller}>{item.seller}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function SyncalotScreen({ openModal }) {
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [switching, setSwitching] = useState(false);

  const [accountName, setAccountName] = useState("");
  const [accountUsername, setAccountUsername] = useState("");
  const [headline, setHeadline] = useState("");
  const [industry, setIndustry] = useState("");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");

  const loadSyncalot = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAccounts([]);
        setActiveAccount(null);
        return;
      }

      const { data: accountData, error: accountError } =
        await supabase
          .from("syncalot_profiles")
          .select("*")
          .eq("user_id", user.id)
          .is("deleted_at", null)
          .order("is_default", { ascending: false })
          .order("last_active_at", { ascending: false });

      if (accountError) throw accountError;

      const userAccounts = accountData || [];
      setAccounts(userAccounts);

      const { data: sessionData } = await supabase
        .from("syncalot_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("last_active_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let profileId = sessionData?.syncalot_profile_id;

      if (!profileId && userAccounts.length > 0) {
        const defaultAccount =
          userAccounts.find((item) => item.is_default) ||
          userAccounts[0];

        profileId = defaultAccount.id;

        await supabase
          .from("syncalot_sessions")
          .insert({
            user_id: user.id,
            syncalot_profile_id: profileId,
            is_active: true,
            last_active_at: new Date().toISOString(),
          });
      }

      if (!profileId) {
        setActiveAccount(null);
        setPosts([]);
        setJobs([]);
        setConnections([]);
        return;
      }

      const currentAccount =
        userAccounts.find(
          (item) => item.id === profileId
        ) || null;

      setActiveAccount(currentAccount);

      if (!currentAccount) return;

      await supabase
        .from("syncalot_profiles")
        .update({
          last_active_at: new Date().toISOString(),
        })
        .eq("id", profileId)
        .eq("user_id", user.id);

      const { data: postData } = await supabase
        .from("syncalot_posts")
        .select("*")
        .eq("syncalot_profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(20);

      setPosts(postData || []);

      const { data: jobData } = await supabase
        .from("syncalot_jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);

      setJobs(jobData || []);

      const { data: connectionData } = await supabase
        .from("syncalot_connections")
        .select("*")
        .or(
          `requester_syncalot_profile_id.eq.${profileId},recipient_syncalot_profile_id.eq.${profileId}`
        )
        .order("created_at", { ascending: false })
        .limit(30);

      setConnections(connectionData || []);
    } catch (error) {
      console.log("Syncalot error:", error);

      Alert.alert(
        "Syncalot",
        error?.message || "Unable to load Syncalot."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSyncalot();
  }, []);

  const createAccount = async () => {
    if (!accountName.trim()) {
      Alert.alert("Syncalot", "Enter an account name.");
      return;
    }

    if (!accountUsername.trim()) {
      Alert.alert("Syncalot", "Enter a username.");
      return;
    }

    try {
      setCreating(true);

      const { error } = await supabase.rpc(
        "syncalot_create_account",
        {
          p_account_name: accountName.trim(),
          p_account_username: accountUsername
            .trim()
            .replace(/^@/, "")
            .toLowerCase(),
          p_headline: headline.trim() || null,
          p_industry: industry.trim() || null,
          p_current_position: position.trim() || null,
          p_current_company: company.trim() || null,
          p_location: location.trim() || null,
        }
      );

      if (error) throw error;

      setAccountName("");
      setAccountUsername("");
      setHeadline("");
      setIndustry("");
      setPosition("");
      setCompany("");
      setLocation("");

      setShowCreate(false);

      await loadSyncalot();

      Alert.alert(
        "Syncalot",
        "Professional account created successfully."
      );
    } catch (error) {
      Alert.alert(
        "Unable to create account",
        error?.message || "Something went wrong."
      );
    } finally {
      setCreating(false);
    }
  };

  const switchAccount = async (account) => {
    if (!account?.id) return;

    if (account.id === activeAccount?.id) {
      setShowAccounts(false);
      return;
    }

    try {
      setSwitching(true);

      const { error } = await supabase.rpc(
        "syncalot_switch_account",
        {
          p_target_syncalot_profile_id: account.id,
        }
      );

      if (error) throw error;

      setShowAccounts(false);

      await loadSyncalot();
    } catch (error) {
      Alert.alert(
        "Unable to switch account",
        error?.message || "Something went wrong."
      );
    } finally {
      setSwitching(false);
    }
  };

  const logoutSyncalot = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from("syncalot_sessions")
        .update({
          is_active: false,
          logged_out_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("is_active", true);

      setActiveAccount(null);
      setPosts([]);
      setJobs([]);
      setConnections([]);
      setShowAccounts(false);
    } catch (error) {
      Alert.alert(
        "Syncalot",
        error?.message || "Unable to log out."
      );
    }
  };

  const deleteAccount = () => {
    if (!activeAccount?.id) return;

    Alert.alert(
      "Delete Syncalot account",
      "This deletes only this Syncalot account. Your OZAGU account will remain active.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("syncalot_profiles")
                .update({
                  account_status: "inactive",
                  deleted_at: new Date().toISOString(),
                  is_default: false,
                })
                .eq("id", activeAccount.id);

              if (error) throw error;

              await supabase
                .from("syncalot_sessions")
                .update({
                  is_active: false,
                  logged_out_at:
                    new Date().toISOString(),
                })
                .eq(
                  "syncalot_profile_id",
                  activeAccount.id
                );

              setActiveAccount(null);
              setPosts([]);
              setJobs([]);
              setConnections([]);
              setShowAccounts(false);

              await loadSyncalot();
            } catch (error) {
              Alert.alert(
                "Unable to delete account",
                error?.message || "Something went wrong."
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <TopHeader
          title="Syncalot"
          onSearch={() => openModal("search")}
          onAI={() => openModal("ai")}
        />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator
            size="large"
            color={OZAGU.purple}
          />

          <Text
            style={{
              color: OZAGU.muted,
              marginTop: 12,
            }}
          >
            Loading Syncalot...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeAccount) {
    return (
      <SafeAreaView style={styles.screen}>
        <TopHeader
          title="Syncalot"
          onSearch={() => openModal("search")}
          onAI={() => openModal("ai")}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.syncalotContent}
        >
          <View style={styles.syncalotHero}>
            <View style={styles.syncalotHeroIcon}>
              <Ionicons
                name="briefcase"
                size={28}
                color={OZAGU.white}
              />
            </View>

            <Text style={styles.syncalotHeroTitle}>
              Build your professional presence
            </Text>

            <Text style={styles.syncalotHeroSubtitle}>
              Create a separate Syncalot professional
              account for your career, business, jobs,
              clients and professional network.
            </Text>

            <Pressable
              style={styles.syncalotPrimaryButton}
              onPress={() => setShowCreate(true)}
            >
              <Ionicons
                name="add-circle-outline"
                size={18}
                color={OZAGU.white}
              />

              <Text
                style={styles.syncalotPrimaryButtonText}
              >
                Create Syncalot Account
              </Text>
            </Pressable>
          </View>

          <View style={styles.syncalotSectionHeader}>
            <Text style={styles.syncalotSectionTitle}>
              Professional Network
            </Text>
          </View>

          <View style={styles.syncalotQuickGrid}>
            <Pressable
              style={styles.syncalotQuickCard}
              onPress={() => openModal("findWork")}
            >
              <View
                style={[
                  styles.syncalotQuickIcon,
                  {
                    backgroundColor:
                      "rgba(124,58,237,0.18)",
                  },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={22}
                  color={OZAGU.purple}
                />
              </View>

              <Text style={styles.syncalotQuickTitle}>
                Find Work
              </Text>

              <Text style={styles.syncalotQuickText}>
                Discover professional opportunities.
              </Text>
            </Pressable>

            <Pressable
              style={styles.syncalotQuickCard}
              onPress={() =>
                openModal("findClients")
              }
            >
              <View
                style={[
                  styles.syncalotQuickIcon,
                  {
                    backgroundColor:
                      "rgba(37,99,235,0.18)",
                  },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={22}
                  color={OZAGU.blue}
                />
              </View>

              <Text style={styles.syncalotQuickTitle}>
                Find Clients
              </Text>

              <Text style={styles.syncalotQuickText}>
                Connect with clients and businesses.
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <TopHeader
        title="Syncalot"
        onSearch={() => openModal("search")}
        onAI={() => openModal("ai")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.syncalotContent}
      >
        {/* ACTIVE SYNCALOT ACCOUNT */}
        <View
          style={{
            backgroundColor: OZAGU.surface,
            borderRadius: 18,
            padding: 16,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: OZAGU.surface2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Avatar
              uri={
                activeAccount.avatar_url ||
                activeAccount.profile_image_url ||
                null
              }
              size={58}
            />

            <View
              style={{
                flex: 1,
                marginLeft: 12,
              }}
            >
              <Text
                style={{
                  color: OZAGU.white,
                  fontSize: 19,
                  fontWeight: "800",
                }}
              >
                {activeAccount.account_name}
              </Text>

              <Text
                style={{
                  color: OZAGU.muted,
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                @{activeAccount.account_username}
              </Text>

              {activeAccount.headline ? (
                <Text
                  style={{
                    color: OZAGU.white,
                    fontSize: 13,
                    marginTop: 5,
                  }}
                  numberOfLines={2}
                >
                  {activeAccount.headline}
                </Text>
              ) : null}
            </View>
          </View>

          <Pressable
            style={{
              marginTop: 14,
              height: 44,
              borderRadius: 12,
              backgroundColor: OZAGU.surface2,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onPress={() => setShowAccounts(true)}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={20}
              color={OZAGU.white}
            />

            <Text
              style={{
                color: OZAGU.white,
                fontWeight: "700",
              }}
            >
              Manage Syncalot Accounts
            </Text>
          </Pressable>
        </View>

        {/* PROFILE ACTIONS */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 15,
          }}
        >
          <Pressable
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              backgroundColor: OZAGU.surface,
              borderWidth: 1,
              borderColor: OZAGU.surface2,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 7,
            }}
            onPress={() =>
              openModal(
                "professionalProfile",
                activeAccount
              )
            }
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={OZAGU.white}
            />

            <Text
              style={{
                color: OZAGU.white,
                fontWeight: "600",
              }}
            >
              Edit Profile
            </Text>
          </Pressable>

          <Pressable
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              backgroundColor: OZAGU.surface,
              borderWidth: 1,
              borderColor: OZAGU.surface2,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 7,
            }}
            onPress={() =>
              openModal(
                "professionalProfile",
                activeAccount
              )
            }
          >
            <Ionicons
              name="eye-outline"
              size={18}
              color={OZAGU.white}
            />

            <Text
              style={{
                color: OZAGU.white,
                fontWeight: "600",
              }}
            >
              View Profile
            </Text>
          </Pressable>
        </View>

        {/* NETWORK */}
        <View style={styles.syncalotSectionHeader}>
          <Text style={styles.syncalotSectionTitle}>
            Professional Network
          </Text>
        </View>

        <View style={styles.syncalotQuickGrid}>
          <Pressable
            style={styles.syncalotQuickCard}
            onPress={() => openModal("findWork")}
          >
            <View
              style={[
                styles.syncalotQuickIcon,
                {
                  backgroundColor:
                    "rgba(124,58,237,0.18)",
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={22}
                color={OZAGU.purple}
              />
            </View>

            <Text style={styles.syncalotQuickTitle}>
              Find Work
            </Text>

            <Text style={styles.syncalotQuickText}>
              Discover jobs and opportunities.
            </Text>
          </Pressable>

          <Pressable
            style={styles.syncalotQuickCard}
            onPress={() =>
              openModal("findClients")
            }
          >
            <View
              style={[
                styles.syncalotQuickIcon,
                {
                  backgroundColor:
                    "rgba(37,99,235,0.18)",
                },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={22}
                color={OZAGU.blue}
              />
            </View>

            <Text style={styles.syncalotQuickTitle}>
              Find Clients
            </Text>

            <Text style={styles.syncalotQuickText}>
              Find clients and businesses.
            </Text>
          </Pressable>
        </View>

        {/* STATS */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: OZAGU.surface,
            borderRadius: 16,
            paddingVertical: 17,
            marginBottom: 18,
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: OZAGU.white,
                fontSize: 20,
                fontWeight: "800",
              }}
            >
              {connections.length}
            </Text>

            <Text
              style={{
                color: OZAGU.muted,
                fontSize: 12,
              }}
            >
              Connections
            </Text>
          </View>

          <View
            style={{
              width: 1,
              backgroundColor: OZAGU.surface2,
            }}
          />

          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: OZAGU.white,
                fontSize: 20,
                fontWeight: "800",
              }}
            >
              {posts.length}
            </Text>

            <Text
              style={{
                color: OZAGU.muted,
                fontSize: 12,
              }}
            >
              Posts
            </Text>
          </View>

          <View
            style={{
              width: 1,
              backgroundColor: OZAGU.surface2,
            }}
          />

          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: OZAGU.white,
                fontSize: 20,
                fontWeight: "800",
              }}
            >
              {jobs.length}
            </Text>

            <Text
              style={{
                color: OZAGU.muted,
                fontSize: 12,
              }}
            >
              Jobs
            </Text>
          </View>
        </View>

        {/* JOBS */}
        <View style={styles.syncalotSectionHeader}>
          <Text style={styles.syncalotSectionTitle}>
            Opportunities
          </Text>

          <Ionicons
            name="briefcase-outline"
            size={21}
            color={OZAGU.purple}
          />
        </View>

        {jobs.length === 0 ? (
          <View
            style={{
              backgroundColor: OZAGU.surface,
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Ionicons
              name="briefcase-outline"
              size={30}
              color={OZAGU.muted}
            />

            <Text
              style={{
                color: OZAGU.white,
                fontWeight: "700",
                marginTop: 10,
              }}
            >
              No active jobs yet
            </Text>

            <Text
              style={{
                color: OZAGU.muted,
                fontSize: 13,
                textAlign: "center",
                marginTop: 5,
              }}
            >
              Professional opportunities will appear
              here.
            </Text>
          </View>
        ) : (
          jobs.slice(0, 5).map((job) => (
            <Pressable
              key={job.id}
              style={{
                backgroundColor: OZAGU.surface,
                borderRadius: 16,
                padding: 15,
                marginBottom: 10,
              }}
              onPress={() =>
                openModal("job", job)
              }
            >
              <Text
                style={{
                  color: OZAGU.white,
                  fontSize: 15,
                  fontWeight: "700",
                }}
              >
                {job.title}
              </Text>

              <Text
                style={{
                  color: OZAGU.muted,
                  fontSize: 12,
                  marginTop: 5,
                }}
              >
                {job.employment_type ||
                  "Professional opportunity"}
                {job.workplace_type
                  ? ` · ${job.workplace_type}`
                  : ""}
              </Text>

              {job.location ? (
                <Text
                  style={{
                    color: OZAGU.muted,
                    fontSize: 12,
                    marginTop: 3,
                  }}
                >
                  {job.location}
                </Text>
              ) : null}
            </Pressable>
          ))
        )}

        {/* POSTS */}
        <View style={styles.syncalotSectionHeader}>
          <Text style={styles.syncalotSectionTitle}>
            Professional Activity
          </Text>

          <Ionicons
            name="newspaper-outline"
            size={21}
            color={OZAGU.purple}
          />
        </View>

        {posts.length === 0 ? (
          <View
            style={{
              backgroundColor: OZAGU.surface,
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
            }}
          >
            <Ionicons
              name="create-outline"
              size={30}
              color={OZAGU.muted}
            />

            <Text
              style={{
                color: OZAGU.white,
                fontWeight: "700",
                marginTop: 10,
              }}
            >
              No professional posts yet
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <View
              key={post.id}
              style={{
                backgroundColor: OZAGU.surface,
                borderRadius: 16,
                padding: 15,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Avatar
                  uri={
                    activeAccount.avatar_url ||
                    activeAccount.profile_image_url ||
                    null
                  }
                  size={45}
                />

                <View style={{ marginLeft: 10 }}>
                  <Text
                    style={{
                      color: OZAGU.white,
                      fontWeight: "700",
                    }}
                  >
                    {activeAccount.account_name}
                  </Text>

                  <Text
                    style={{
                      color: OZAGU.muted,
                      fontSize: 12,
                    }}
                  >
                    @{activeAccount.account_username}
                  </Text>
                </View>
              </View>

              {post.content ? (
                <Text
                  style={{
                    color: OZAGU.white,
                    fontSize: 14,
                    lineHeight: 21,
                    marginTop: 13,
                  }}
                >
                  {post.content}
                </Text>
              ) : null}

              {post.media_url ? (
                <Image
                  source={{ uri: post.media_url }}
                  style={{
                    width: "100%",
                    height: 220,
                    borderRadius: 13,
                    marginTop: 12,
                  }}
                  resizeMode="cover"
                />
              ) : null}

              <View
                style={{
                  flexDirection: "row",
                  gap: 15,
                  marginTop: 12,
                }}
              >
                <Text
                  style={{
                    color: OZAGU.muted,
                    fontSize: 11,
                  }}
                >
                  {post.likes_count || 0} likes
                </Text>

                <Text
                  style={{
                    color: OZAGU.muted,
                    fontSize: 11,
                  }}
                >
                  {post.comments_count || 0} comments
                </Text>

                <Text
                  style={{
                    color: OZAGU.muted,
                    fontSize: 11,
                  }}
                >
                  {post.shares_count || 0} shares
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ACCOUNT MANAGER */}
      <Modal
        visible={showAccounts}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowAccounts(false)
        }
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.78)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: OZAGU.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 18,
              maxHeight: "85%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <Text
                style={{
                  color: OZAGU.white,
                  fontSize: 20,
                  fontWeight: "800",
                }}
              >
                Syncalot Accounts
              </Text>

              <Pressable
                onPress={() =>
                  setShowAccounts(false)
                }
              >
                <Ionicons
                  name="close"
                  size={25}
                  color={OZAGU.white}
                />
              </Pressable>
            </View>

            {accounts.map((account) => (
              <Pressable
                key={account.id}
                disabled={switching}
                onPress={() =>
                  switchAccount(account)
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor:
                    account.id === activeAccount?.id
                      ? "rgba(168,85,247,0.14)"
                      : OZAGU.surface,
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 9,
                  borderWidth: 1,
                  borderColor:
                    account.id === activeAccount?.id
                      ? OZAGU.purple
                      : OZAGU.surface2,
                }}
              >
                <Avatar
                  uri={
                    account.avatar_url ||
                    account.profile_image_url ||
                    null
                  }
                  size={48}
                />

                <View
                  style={{
                    flex: 1,
                    marginLeft: 11,
                  }}
                >
                  <Text
                    style={{
                      color: OZAGU.white,
                      fontWeight: "700",
                    }}
                  >
                    {account.account_name}
                  </Text>

                  <Text
                    style={{
                      color: OZAGU.muted,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    @{account.account_username}
                  </Text>

                  {account.headline ? (
                    <Text
                      style={{
                        color: OZAGU.muted,
                        fontSize: 11,
                        marginTop: 3,
                      }}
                      numberOfLines={1}
                    >
                      {account.headline}
                    </Text>
                  ) : null}
                </View>

                {account.id === activeAccount?.id ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={OZAGU.purple}
                  />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={OZAGU.muted}
                  />
                )}
              </Pressable>
            ))}

            <Pressable
              style={{
                height: 48,
                borderRadius: 13,
                backgroundColor: OZAGU.surface,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                marginTop: 8,
              }}
              onPress={() => {
                setShowAccounts(false);
                setShowCreate(true);
              }}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={OZAGU.white}
              />

              <Text
                style={{
                  color: OZAGU.white,
                  fontWeight: "700",
                }}
              >
                Create Another Syncalot Account
              </Text>
            </Pressable>

            <Pressable
              style={{
                height: 48,
                borderRadius: 13,
                backgroundColor: OZAGU.surface,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                marginTop: 9,
              }}
              onPress={logoutSyncalot}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={OZAGU.white}
              />

              <Text
                style={{
                  color: OZAGU.white,
                  fontWeight: "700",
                }}
              >
                Log Out of Syncalot
              </Text>
            </Pressable>

            <Pressable
              style={{
                height: 48,
                borderRadius: 13,
                backgroundColor: OZAGU.surface,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                marginTop: 9,
                marginBottom: 10,
              }}
              onPress={deleteAccount}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={OZAGU.white}
              />

              <Text
                style={{
                  color: OZAGU.white,
                  fontWeight: "700",
                }}
              >
                Delete This Syncalot Account
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* CREATE ACCOUNT MODAL */}
      <Modal
        visible={showCreate}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowCreate(false)
        }
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.78)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: OZAGU.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 18,
              maxHeight: "92%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <Text
                style={{
                  color: OZAGU.white,
                  fontSize: 20,
                  fontWeight: "800",
                }}
              >
                Create Syncalot Account
              </Text>

              <Pressable
                onPress={() =>
                  setShowCreate(false)
                }
              >
                <Ionicons
                  name="close"
                  size={25}
                  color={OZAGU.white}
                />
              </Pressable>
            </View>

            <ScrollView>
              <TextInput
                style={{
                  backgroundColor: OZAGU.surface,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  color: OZAGU.white,
                  marginBottom: 10,
                }}
                placeholder="Professional account name"
                placeholderTextColor={OZAGU.muted}
                value={accountName}
                onChangeText={setAccountName}
              />

              <TextInput
                style={{
                  backgroundColor: OZAGU.surface,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  color: OZAGU.white,
                  marginBottom: 10,
                }}
                placeholder="@username"
                placeholderTextColor={OZAGU.muted}
                value={accountUsername}
                onChangeText={setAccountUsername}
                autoCapitalize="none"
              />

              <TextInput
                style={{
                  backgroundColor: OZAGU.surface,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  color: OZAGU.white,
                  marginBottom: 10,
                }}
                placeholder="Professional headline"
                placeholderTextColor={OZAGU.muted}
                value={headline}
                onChangeText={setHeadline}
              />

              <TextInput
                style={{
                  backgroundColor: OZAGU.surface,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  color: OZAGU.white,
                  marginBottom: 10,
                }}
                placeholder="Industry"
                placeholderTextColor={OZAGU.muted}
                value={industry}
                onChangeText={setIndustry}
              />

              <TextInput
                style={{
                  backgroundColor: OZAGU.surface,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  color: OZAGU.white,
                  marginBottom: 10,
                }}
                placeholder="Current position"
                placeholderTextColor={OZAGU.muted}
                value={position}
                onChangeText={setPosition}
              />

              <TextInput
                style={{
                  backgroundColor: OZAGU.surface,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  color: OZAGU.white,
                  marginBottom: 10,
                }}
                placeholder="Current company"
                placeholderTextColor={OZAGU.muted}
                value={company}
                onChangeText={setCompany}
              />

              <TextInput
                style={{
                  backgroundColor: OZAGU.surface,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  color: OZAGU.white,
                  marginBottom: 15,
                }}
                placeholder="Professional location"
                placeholderTextColor={OZAGU.muted}
                value={location}
                onChangeText={setLocation}
              />

              <Pressable
                style={[
                  styles.syncalotPrimaryButton,
                  creating && { opacity: 0.6 },
                ]}
                disabled={creating}
                onPress={createAccount}
              >
                {creating ? (
                  <ActivityIndicator
                    color={OZAGU.white}
                  />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={19}
                      color={OZAGU.white}
                    />

                    <Text
                      style={
                        styles.syncalotPrimaryButtonText
                      }
                    >
                      Create Account
                    </Text>
                  </>
                )}
              </Pressable>

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
                

function MeScreen({ openModal, navigate }) {
 const { isDark, toggle } = useTheme();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          Alert.alert("Profile error", userError.message);
          return;
        }

        if (!user) {
          Alert.alert("Profile error", "No signed-in user was found.");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, username, display_name, bio, avatar_url, cover_url, followers_count, following_count, posts_count, is_verified"
          )
          .eq("id", user.id)
          .single();

        if (error) {
          Alert.alert("Profile error", error.message);
          return;
        }

        if (mounted) {
          setProfile(data);
        }
      } catch (error) {
        Alert.alert(
          "Profile error",
          error?.message || "Unable to load your profile."
        );
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const saveProfile = async (fields) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: fields.username,
        display_name: fields.displayName,
        bio: fields.bio,
        avatar_url: fields.avatarUrl,
      })
      .eq("id", user.id)
      .select(
        "id, username, display_name, bio, avatar_url, cover_url, followers_count, following_count, posts_count, is_verified"
      )
      .single();

    if (error) {
      Alert.alert("Update failed", error.message);
      return false;
    }

    setProfile(data);

    return true;
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Logout failed", error.message);
    }
  };

  const menu = [
    ["Saved", "▣", "saved"],
    ["Downloads", "↓", "downloads"],
    ["Edit profile", "✎", "editProfile"],
    ["Share profile", "↗", "profileShare"],
    ["Settings", "⚙", "settings"],
    ["Beta", "✦", "ai"],
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <TopHeader
        title="ME"
        onSearch={() => openModal("search")}
        onAI={() => openModal("ai")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.meContent}
      >
        <View style={styles.profileCard}>
          <Avatar
            uri={profile?.avatar_url || AVATARS.user}
            size={88}
            border
          />

          <Text style={styles.profileName}>
            {profile?.display_name || "Your Name"}
          </Text>

          <Text style={styles.profileUsername}>
            @{profile?.username || "username"}
          </Text>

          <Text style={styles.profileBio}>
            {profile?.bio || "Welcome to my OZAGU profile."}
          </Text>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatNumber}>
                {profile?.posts_count ?? 0}
              </Text>
              <Text style={styles.profileStatLabel}>Posts</Text>
            </View>

            <View style={styles.profileStat}>
              <Text style={styles.profileStatNumber}>
                {profile?.followers_count ?? 0}
              </Text>
              <Text style={styles.profileStatLabel}>Followers</Text>
            </View>

            <View style={styles.profileStat}>
              <Text style={styles.profileStatNumber}>
                {profile?.following_count ?? 0}
              </Text>
              <Text style={styles.profileStatLabel}>Following</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuCard}>
        <Pressable style={styles.menuRow} onPress={toggle}>
  <View style={styles.menuIcon}>
    <Text style={styles.menuIconText}>{isDark ? "☀" : "☾"}</Text>
  </View>

  <Text style={styles.menuLabel}>
    {isDark ? "Light mode" : "Dark mode"}
  </Text>

  <Text style={styles.menuArrow}>›</Text>
</Pressable>
          {menu.map(([label, icon, action]) => (
            <Pressable
              key={action}
              style={styles.menuRow}
              onPress={() => {
                if (action === "ai") {
                  navigate("ai");
                } else if (action === "editProfile") {
                  openModal("editProfile", {
                    profile,
                    onSave: saveProfile,
                  });
                } else {
                  openModal("menuPage", { title: label });
                }
              }}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>{icon}</Text>
              </View>

              <Text style={styles.menuLabel}>{label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </Pressable>
          ))}

          <Pressable
            style={styles.menuRow}
            onPress={handleLogout}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>↪</Text>
            </View>

            <Text style={styles.menuLabel}>Log Out</Text>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
            
 
function BetaVideoMessage({ source }) {
  const player = useVideoPlayer(source, (player) => {
    player.loop = false;
  });

  return (
    <View style={styles.aiVideoWrap}>
      <VideoView
        player={player}
        style={styles.aiVideo}
        nativeControls
        allowsFullscreen
        contentFit="contain"
      />
    </View>
  );
}

function AIScreen({ openModal,
navigate }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [dbConversationId, setDbConversationId] = useState(null);
  const [conversationId, setConversationId] = useState(
    () => `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const loadConversationMessages = async (convoId) => {
    const { data: rows, error } = await supabase
      .from("ai_messages")
      .select("id, role, content, type, media_url, created_at")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true });

    if (error) {
      Alert.alert("Beta history", error.message);
      return;
    }

    const loaded = (rows || []).map((row) => {
      const type = row.type || "text";
      const msg = {
        id: String(row.id),
        mine: row.role === "user",
        type,
        text: row.content || "",
      };
      if (type === "image") msg.image = row.media_url;
      if (type === "video") msg.video = row.media_url;
      return msg;
    });

    setMessages(loaded);
    setDbConversationId(convoId);
  };

  const send = async () => {
    const text = message.trim();

    if (!text || sending) return;

    const historyForRequest = messages
      .filter((m) => m.text && m.text.trim())
      .map((m) => ({
        role: m.mine ? "user" : "assistant",
        content: m.text,
      }));

    const userMessage = {
      id: `${Date.now()}-user`,
      text,
      mine: true,
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setSending(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("No signed-in OZAGU user was found.");
      }

      let activeConversationDbId = dbConversationId;

      try {
        if (!activeConversationDbId) {
          const { data: convo, error: convoError } = await supabase
            .from("ai_conversations")
            .insert({ user_id: user.id, title: text.slice(0, 60) })
            .select("id")
            .single();

          if (!convoError && convo?.id) {
            activeConversationDbId = convo.id;
            setDbConversationId(convo.id);
          }
        }

        if (activeConversationDbId) {
          await supabase.from("ai_messages").insert({
            conversation_id: activeConversationDbId,
            user_id: user.id,
            role: "user",
            content: text,
            type: "text",
          });
        }
      } catch (persistError) {
        console.log("Beta history save failed:", persistError?.message);
      }

      const { data, error } = await supabase.functions.invoke(
        "beta_ai",
        {
          body: {
            user_id: user.id,
            conversation_id: conversationId,
            mode: "chat",
            message: text,
            history: historyForRequest,
          },
        }
      );

      if (error) {
        console.log(
          "FULL EDGE FUNCTION ERROR:",
          JSON.stringify(error, null, 2)
        );

        Alert.alert(
          "EDGE FUNCTION DEBUG",
          JSON.stringify(error, null, 2)
        );

        throw error;
      }

      if (!data?.success) {
        throw new Error(
          data?.error || "Beta could not answer right now."
        );
      }

      const answer =
        data?.answer ||
        "Beta did not return an answer.";

      if (data?.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const replyType =
        data?.type === "image"
          ? "image"
          : data?.type === "video" ||
            data?.type === "reference_to_video"
          ? "video"
          : "text";

      const replyMessage = {
        id: `${Date.now()}-reply`,
        mine: false,
        type: replyType,
        text: answer,
      };

      if (replyType === "image") {
        replyMessage.image = data?.image;
      }

      if (replyType === "video") {
        replyMessage.video = data?.video;
      }

      setMessages((prev) => [...prev, replyMessage]);

      try {
        if (activeConversationDbId) {
          await supabase.from("ai_messages").insert({
            conversation_id: activeConversationDbId,
            user_id: user.id,
            role: "assistant",
            content: answer,
            type: replyType,
            media_url:
              replyType === "image"
                ? data?.image
                : replyType === "video"
                ? data?.video
                : null,
          });

          await supabase
            .from("ai_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", activeConversationDbId);
        }
      } catch (persistError) {
        console.log("Beta reply save failed:", persistError?.message);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text:
            error?.message ||
            "Unable to connect to Beta right now.",
          mine: false,
          type: "text",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.aiScreen}>
      <View style={styles.aiHeader}>
        <Pressable
          style={styles.aiBack}
          onPress={() => navigate("previous")}
>
          <Text style={styles.aiBackText}>‹</Text>
        </Pressable>

        <View style={styles.aiTitleBox}>
          <View style={styles.aiTitleRow}>
            <Text style={styles.aiTitle}>Beta</Text>
            <Text style={styles.aiBeta}>Beta</Text>
          </View>

          <Text style={styles.aiSubtitle}>
            Ask anything
          </Text>
        </View>

        <IconButton
          label="AI history"
          ionicon="time-outline"
          onPress={() =>
            openModal("aiHistory", {
              onSelect: loadConversationMessages,
            })
          }
        />
      </View>

      {messages.length === 0 ? (
        <View style={styles.aiEmpty}>
          <View style={styles.aiOrb}>
            <Text style={styles.aiOrbText}>✦</Text>
          </View>

          <Text style={styles.aiWelcome}>
            Ask Beta anything
          </Text>

          <Text style={styles.aiHint}>
            Questions, ideas, explanations and more.
          </Text>

          <View style={styles.aiSuggestions}>
            {[
              "Explain something to me",
              "Give me an idea",
              "Help me write something",
            ].map((suggestion) => (
              <Pressable
                key={suggestion}
                style={styles.aiSuggestion}
                onPress={() => setMessage(suggestion)}
              >
                <Text style={styles.aiSuggestionText}>
                  {suggestion}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.aiMessages}
          renderItem={({ item }) => (
            <View
              style={[
                styles.aiBubble,
                item.mine
                  ? styles.aiBubbleMine
                  : styles.aiBubbleOther,
              ]}
            >
              {item.text ? (
                <Text style={styles.aiBubbleText}>
                  {item.text}
                </Text>
              ) : null}

              {item.type === "image" && item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.aiImageMessage}
                />
              ) : null}

              {item.type === "video" && item.video ? (
                <BetaVideoMessage
                  source={{ uri: item.video }}
                />
              ) : null}
            </View>
          )}
          ListFooterComponent={
            sending ? (
              <View
                style={[
                  styles.aiBubble,
                  styles.aiBubbleOther,
                ]}
              >
                <ActivityIndicator
                  size="small"
                  color={OZAGU.purple}
                />
              </View>
            ) : null
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.aiInputBar}>
          <Pressable
            style={styles.aiAttach}
            onPress={() =>
              Alert.alert("Beta", "Attachment options")
            }
          >
            <Text style={styles.aiAttachText}>+</Text>
          </Pressable>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="ASK Beta anything..."
            placeholderTextColor={OZAGU.muted}
            style={styles.aiInput}
            multiline
            editable={!sending}
          />

          <Pressable
            style={styles.aiSend}
            onPress={send}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator
                size="small"
                color={OZAGU.white}
              />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={OZAGU.white}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
  
  function AnimatedCreateButton({ onPress }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 40,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginTop: -28 }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: OZAGU.red,
          alignItems: "center",
          justifyContent: "center",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
        }}
        hitSlop={10}
      >
        <Ionicons name="add" size={36} color={OZAGU.white} />
      </Pressable>
    </Animated.View>
  );
}

function BottomNav({ active, navigate, onCreatePost }) {
  const items = [
    {
      key: "home",
      label: "Home",
      ionicon: "home-outline",
      ioniconActive: "home",
    },
    {
      key: "tv",
      label: "TV",
      ionicon: "play-circle-outline",
      ioniconActive: "play-circle",
    },
     {
      key: "chat",
      label: "Chat",
      ionicon: "chatbubble-ellipses-outline",
      ioniconActive: "chatbubble-ellipses",
    },
    {
      key: "syncalot",
      label: "Syncalot",
      ionicon: "briefcase-outline",
      ioniconActive: "briefcase",
    },
  ];

  return (
    <View
      style={[
        styles.bottomNav,
        {
          position: "relative",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        },
      ]}
    >
      {/* HOME */}
      <Pressable
        style={styles.navItem}
        onPress={() => navigate("home")}
        hitSlop={8}
      >
        <View
          style={[
            styles.navIconWrap,
            active === "home" && styles.navIconWrapActive,
          ]}
        >
          <Ionicons
            name={
              active === "home"
                ? "home"
                : "home-outline"
            }
            size={20}
            color={
              active === "home"
                ? OZAGU.white
                : OZAGU.muted
            }
          />
        </View>

        <Text
          style={[
            styles.navLabel,
            active === "home" && styles.navLabelActive,
          ]}
        >
          Home
        </Text>
      </Pressable>

      {/* TV */}
      <Pressable
        style={styles.navItem}
        onPress={() => navigate("tv")}
        hitSlop={8}
      >
        <View
          style={[
            styles.navIconWrap,
            active === "tv" && styles.navIconWrapActive,
          ]}
        >
          <Ionicons
            name={
              active === "tv"
                ? "play-circle"
                : "play-circle-outline"
            }
            size={20}
            color={
              active === "tv"
                ? OZAGU.white
                : OZAGU.muted
            }
          />
        </View>

        <Text
          style={[
            styles.navLabel,
            active === "tv" && styles.navLabelActive,
          ]}
        >
          TV
        </Text>
      </Pressable>

   <AnimatedCreateButton onPress={onCreatePost} />

      {/* CHAT */}
      <Pressable
        style={styles.navItem}
        onPress={() => navigate("chat")}
        hitSlop={8}
      >
        <View
          style={[
            styles.navIconWrap,
            active === "chat" && styles.navIconWrapActive,
          ]}
        >
          <Ionicons
            name={
              active === "chat"
                ? "chatbubble-ellipses"
                : "chatbubble-ellipses-outline"
            }
            size={20}
            color={
              active === "chat"
                ? OZAGU.white
                : OZAGU.muted
            }
          />
        </View>

        <Text
          style={[
            styles.navLabel,
            active === "chat" && styles.navLabelActive,
          ]}
        >
          Chat
        </Text>
      </Pressable>

      {/* SYNCALOT */}
      <Pressable
        style={styles.navItem}
        onPress={() => navigate("syncalot")}
        hitSlop={8}
      >
        <View
          style={[
            styles.navIconWrap,
            active === "syncalot" &&
              styles.navIconWrapActive,
          ]}
        >
          <Ionicons
            name={
              active === "syncalot"
                ? "briefcase"
                : "briefcase-outline"
            }
            size={20}
            color={
              active === "syncalot"
                ? OZAGU.white
                : OZAGU.muted
            }
          />
        </View>

        <Text
          style={[
            styles.navLabel,
            active === "syncalot" &&
              styles.navLabelActive,
          ]}
        >
          Syncalot
        </Text>
      </Pressable>
    </View>
  );
}

function AIHistoryList({ onSelect }) {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ai_conversations")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (mounted) {
        if (!error) setConversations(data || []);
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.modalBody}>
        <ActivityIndicator color={OZAGU.purple} />
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.modalBody}>
        <Text style={styles.modalHint}>
          Your previous AI conversations will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.modalBody}>
      {conversations.map((c) => (
        <Pressable
          key={c.id}
          style={styles.modalOption}
          onPress={() => onSelect(c.id)}
        >
          <Text style={styles.modalOptionText} numberOfLines={1}>
            {c.title || "Untitled conversation"}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function NewChatList({ close, openModal }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      if (mounted) setMyId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .neq("id", user.id)
        .order("display_name", { ascending: true })
        .limit(50);

      if (mounted) {
        if (!error) setResults(data || []);
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (u) =>
        (u.username || "").toLowerCase().includes(q) ||
        (u.display_name || "").toLowerCase().includes(q)
    );
  }, [query, results]);

  const startChat = async (other) => {
    if (!myId) return;

    // 1. Look for an existing conversation (either direction)
    const { data: existing, error: findErr } = await supabase
      .from("conversations")
      .select("id, user_a, user_b")
      .or(
        `and(user_a.eq.${myId},user_b.eq.${other.id}),and(user_a.eq.${other.id},user_b.eq.${myId})`
      )
      .maybeSingle();

    if (findErr) {
      Alert.alert("Chat error", findErr.message);
      return;
    }

    let conversationId = existing?.id;

    // 2. If none, create it
    if (!conversationId) {
      const [a, b] = myId < other.id ? [myId, other.id] : [other.id, myId];

      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ user_a: a, user_b: b })
        .select("id")
        .single();

      if (error) {
        Alert.alert("Chat error", error.message);
        return;
      }
      conversationId = created.id;
    }

    close();
    setTimeout(() => {
      openModal("conversation", {
        id: conversationId,
        name: other.display_name || other.username,
        username: other.username,
        avatar:
          other.avatar_url || "https://i.pravatar.cc/300?img=68",
        otherUserId: other.id,
      });
    }, 250);
  };

  return (
    <View style={{ padding: 18, minHeight: 400 }}>
      <View style={styles.modalSearch}>
        <Ionicons
          name="search-outline"
          size={20}
          color={OZAGU.muted}
          style={{ marginRight: 7 }}
        />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or @username"
          placeholderTextColor={OZAGU.muted}
          style={styles.modalSearchInput}
        />
      </View>

      {loading ? (
        <View style={{ padding: 30, alignItems: "center" }}>
          <ActivityIndicator color={OZAGU.purple} />
        </View>
      ) : filtered.length === 0 ? (
        <Text
          style={{
            color: OZAGU.muted,
            textAlign: "center",
            marginTop: 30,
          }}
        >
          {query ? "No users found." : "No other users yet."}
        </Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          style={{ marginTop: 12, maxHeight: 420 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.modalUserRow}
              onPress={() => startChat(item)}
            >
              <Avatar
                uri={
                  item.avatar_url || "https://i.pravatar.cc/300?img=68"
                }
                size={44}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.modalUserName}>
                  {item.display_name || item.username}
                </Text>
                <Text style={styles.modalUserUsername}>
                  @{item.username}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={OZAGU.muted}
              />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function ConversationView({ chat, close }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  const [sharedKey, setSharedKey] = useState(null);
  const [error, setError] = useState("");
  const [activeCall, setActiveCall] = useState(null);
  const listRef = React.useRef(null);
  const sharedKeyRef = React.useRef(null);

  const startCall = (mode) => {
  setActiveCall({
    mode,
    target: {
      id: chat.otherUserId,
      name: chat.name,
      avatar: chat.avatar,
    },
    isGroup: false,
  });
};

  const getSharedKey = async () => {
    if (sharedKeyRef.current) return sharedKeyRef.current;

    const { getCachedPrivateKey, deriveSharedKey } = require("./crypto");

    const myPrivate = await getCachedPrivateKey();
    if (!myPrivate) throw new Error("Your encryption key is locked.");

    const { data: theirKey } = await supabase
      .from("user_public_keys")
      .select("public_key")
      .eq("user_id", chat.otherUserId)
      .maybeSingle();

    if (!theirKey?.public_key) {
      throw new Error("This user hasn't set up encrypted chat yet.");
    }

    const key = await deriveSharedKey(myPrivate, theirKey.public_key);
    sharedKeyRef.current = key;
    setSharedKey(key);
    return key;
  };

  const loadMessages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setMyId(user.id);

      const key = await getSharedKey();

      const { data, error: loadErr } = await supabase
        .from("messages")
        .select("id, sender_id, ciphertext, iv, created_at")
        .eq("conversation_id", chat.id)
        .eq("is_group", false)
        .order("created_at", { ascending: true });

      if (loadErr) throw loadErr;

      const { decryptMessage } = require("./crypto");

      const decrypted = await Promise.all(
        (data || []).map(async (m) => {
          try {
            const plain = await decryptMessage(m.ciphertext, m.iv, key);
            return {
              id: m.id,
              sender_id: m.sender_id,
              text: plain,
              created_at: m.created_at,
              failed: false,
            };
          } catch {
            return {
              id: m.id,
              sender_id: m.sender_id,
              text: "[Unable to decrypt]",
              created_at: m.created_at,
              failed: true,
            };
          }
        })
      );

      setMessages(decrypted);
    } catch (err) {
      setError(err?.message || "Could not load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`conv-${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${chat.id}`,
        },
        async (payload) => {
          const row = payload.new;
          const key = sharedKeyRef.current;
          if (!key) return;

          try {
            const { decryptMessage } = require("./crypto");
            const plain = await decryptMessage(row.ciphertext, row.iv, key);
            setMessages((prev) => [
              ...prev,
              {
                id: row.id,
                sender_id: row.sender_id,
                text: plain,
                created_at: row.created_at,
                failed: false,
              },
            ]);
          } catch {
            setMessages((prev) => [
              ...prev,
              {
                id: row.id,
                sender_id: row.sender_id,
                text: "[Unable to decrypt]",
                created_at: row.created_at,
                failed: true,
              },
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat.id]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || !sharedKey) return;

    setSending(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      const { encryptMessage } = require("./crypto");
      const { ciphertext, iv } = await encryptMessage(trimmed, sharedKey);

      const { error: insErr } = await supabase.from("messages").insert({
        conversation_id: chat.id,
        sender_id: user.id,
        ciphertext,
        iv,
        is_group: false,
      });

      if (insErr) throw insErr;

      setText("");
    } catch (err) {
      Alert.alert("Send failed", err?.message || "Try again.");
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // Show CallScreen instead of chat when a call is active
  // ============================================================
  if (activeCall) {
    return (
      <CallScreen
  mode={activeCall.mode}
  target={activeCall.target}
  isGroup={activeCall.isGroup}
  onEnd={() => setActiveCall(null)}
/>
    );
  }

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: "center" }}>
        <ActivityIndicator color={OZAGU.purple} />
        <Text style={{ color: OZAGU.muted, marginTop: 12 }}>
          Decrypting messages…
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 30, alignItems: "center" }}>
        <Ionicons name="lock-closed-outline" size={40} color={OZAGU.red} />
        <Text
          style={{
            color: OZAGU.white,
            marginTop: 12,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, maxHeight: 560 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
          renderItem={({ item }) => {
            const mine = item.sender_id === myId;
            return (
              <View
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  backgroundColor: mine ? OZAGU.violet : OZAGU.surface2,
                  padding: 11,
                  borderRadius: 16,
                  marginBottom: 8,
                  maxWidth: "80%",
                }}
              >
                <Text
                  style={{
                    color: OZAGU.white,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  {item.text}
                </Text>
                <Text
                  style={{
                    color: mine ? "rgba(255,255,255,0.6)" : OZAGU.muted,
                    fontSize: 9,
                    marginTop: 4,
                    alignSelf: "flex-end",
                  }}
                >
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text
              style={{
                color: OZAGU.muted,
                textAlign: "center",
                marginTop: 40,
                fontSize: 13,
              }}
            >
              Say hi to {chat.name} 👋{"\n"}
              <Text style={{ fontSize: 11 }}>
                Messages are end-to-end encrypted
              </Text>
            </Text>
          }
        />

        {/* ============================================ */}
        {/* Call buttons row                              */}
        {/* ============================================ */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 10,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: OZAGU.border,
          }}
        >
          <Pressable
            onPress={() => startCall("audio")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: OZAGU.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="call-outline" size={20} color={OZAGU.white} />
          </Pressable>

          <Pressable
            onPress={() => startCall("video")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: OZAGU.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="videocam-outline"
              size={20}
              color={OZAGU.white}
            />
          </Pressable>
        </View>

        {/* ============================================ */}
        {/* Message input bar                             */}
        {/* ============================================ */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: OZAGU.border,
            backgroundColor: OZAGU.surface,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor={OZAGU.muted}
            style={{
              flex: 1,
              minHeight: 42,
              maxHeight: 100,
              backgroundColor: OZAGU.surface2,
              borderRadius: 21,
              paddingHorizontal: 16,
              paddingVertical: 10,
              color: OZAGU.white,
              fontSize: 14,
            }}
            multiline
          />

          <Pressable
            onPress={send}
            disabled={sending || !text.trim() || !sharedKey}
            style={{
              marginLeft: 8,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: text.trim() ? OZAGU.violet : OZAGU.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color={OZAGU.white} />
            ) : (
              <Ionicons name="send" size={20} color={OZAGU.white} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
              

function CallScreen({ mode, target, isGroup, onEnd }) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState(null);
  const [joining, setJoining] = useState(true);
  const [error, setError] = useState("");
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(mode === "video");
  const [elapsed, setElapsed] = useState(0);
  const [participantCount, setParticipantCount] = useState(1);
  const [showParticipants, setShowParticipants] = useState(false);

  const callId = useMemo(() => {
    if (!client) return null;
    const meId = client.streamClient?.user?.id || client.user?.id || "";
    if (isGroup) return `ozagu-group-${target.id}`;
    const ids = [meId, target.id].sort();
    return `ozagu-call-${ids.join("-")}`;
  }, [client, target?.id, isGroup]);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = null;

    const start = async () => {
      try {
        if (!client || !callId) throw new Error("Stream client not ready");

        const callType = mode === "video" ? "default" : "audio_room";
        const c = client.call(callType, callId);
        await c.join({ create: true });

        if (mode === "video") {
          await c.camera.enable();
        } else {
          await c.camera.disable().catch(() => {});
        }
        await c.microphone.enable();

        if (mounted) {
          setCall(c);
          setJoining(false);

          // Track participant count
          try {
            unsubscribe = c.state.participants$.subscribe((parts) => {
              setParticipantCount((parts || []).length || 1);
            });
          } catch {}
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Could not join call");
          setJoining(false);
        }
      }
    };

    start();

    return () => {
      mounted = false;
      try {
        unsubscribe?.unsubscribe?.();
      } catch {}
    };
  }, [client, callId, mode]);

  useEffect(() => {
    if (!call) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [call]);

  const hangUp = async () => {
    try {
      if (call) {
        await call.leave();
        if (!isGroup) {
          await call.endCall().catch(() => {});
        }
      }
    } catch {}
    onEnd?.();
  };

  const toggleMic = async () => {
    if (!call) return;
    try {
      if (micEnabled) await call.microphone.disable();
      else await call.microphone.enable();
      setMicEnabled(!micEnabled);
    } catch {}
  };

  const toggleCamera = async () => {
    if (!call || mode !== "video") return;
    try {
      if (cameraEnabled) await call.camera.disable();
      else await call.camera.enable();
      setCameraEnabled(!cameraEnabled);
    } catch {}
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (error) {
    return (
      <SafeAreaView style={styles.screen}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Ionicons name="alert-circle-outline" size={48} color={OZAGU.red} />
          <Text
            style={{
              color: OZAGU.white,
              marginTop: 16,
              textAlign: "center",
              fontSize: 14,
            }}
          >
            {error}
          </Text>
          <Pressable
            style={[styles.primaryButton, { marginTop: 24, width: 200 }]}
            onPress={onEnd}
          >
            <Text style={styles.primaryButtonText}>Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: "#000" }]}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 10,
            alignItems: "center",
          }}
        >
          {!isGroup ? (
            <Avatar uri={target?.avatar} size={84} border />
          ) : (
            <View
              style={{
                width: 84,
                height: 84,
                borderRadius: 42,
                backgroundColor: OZAGU.violet,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="people" size={40} color={OZAGU.white} />
            </View>
          )}

          <Text
            style={{
              color: OZAGU.white,
              fontSize: 20,
              fontWeight: "800",
              marginTop: 12,
              fontFamily: "SpaceGrotesk-Bold",
            }}
          >
            {target?.name || "Unknown"}
          </Text>

          <Text style={{ color: OZAGU.muted, fontSize: 13, marginTop: 6 }}>
            {joining
              ? "Connecting…"
              : `${fmt(elapsed)} · ${participantCount} ${
                  participantCount === 1 ? "person" : "people"
                }`}
          </Text>
        </View>

        {/* Video area */}
        <View style={{ flex: 1 }}>
          {call && mode === "video" ? (
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          ) : call ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!isGroup ? (
                <Avatar uri={target?.avatar} size={140} border />
              ) : (
                <Ionicons name="people" size={80} color={OZAGU.violet} />
              )}
              <Text
                style={{
                  color: OZAGU.muted,
                  marginTop: 20,
                  fontSize: 13,
                }}
              >
                Voice call in progress
              </Text>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="large" color={OZAGU.purple} />
            </View>
          )}
        </View>

        {/* Controls */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 16,
            paddingVertical: 40,
          }}
        >
          <Pressable
            onPress={toggleMic}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: micEnabled ? OZAGU.surface2 : OZAGU.white,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={micEnabled ? "mic" : "mic-off"}
              size={24}
              color={micEnabled ? OZAGU.white : "#000"}
            />
          </Pressable>

          {mode === "video" ? (
            <Pressable
              onPress={toggleCamera}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: cameraEnabled ? OZAGU.surface2 : OZAGU.white,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={cameraEnabled ? "videocam" : "videocam-off"}
                size={24}
                color={cameraEnabled ? OZAGU.white : "#000"}
              />
            </Pressable>
          ) : null}

          {isGroup ? (
            <Pressable
              onPress={() => setShowParticipants((v) => !v)}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: showParticipants
                  ? OZAGU.violet
                  : OZAGU.surface2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="people-outline"
                size={24}
                color={OZAGU.white}
              />
            </Pressable>
          ) : null}

          {mode === "video" ? (
            <Pressable
              onPress={() => {
                // Placeholder for grid/speaker toggle
              }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: OZAGU.surface2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="grid-outline" size={22} color={OZAGU.white} />
            </Pressable>
          ) : null}

          <Pressable
            onPress={hangUp}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: OZAGU.red,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="call" size={26} color={OZAGU.white} />
          </Pressable>
        </View>

        {/* Participants panel (groups only) */}
        {showParticipants && isGroup ? (
          <View
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 240,
              backgroundColor: OZAGU.surface,
              borderLeftWidth: 1,
              borderLeftColor: OZAGU.border,
              padding: 14,
              zIndex: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  color: OZAGU.white,
                  fontWeight: "800",
                  fontSize: 15,
                }}
              >
                Participants
              </Text>
              <Pressable onPress={() => setShowParticipants(false)}>
                <Ionicons name="close" size={22} color={OZAGU.white} />
              </Pressable>
            </View>
            <Text style={{ color: OZAGU.muted, fontSize: 12 }}>
              {participantCount} in this call
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
      

function AddContactScreen({ close, openModal }) {
  const [phone, setPhone] = useState("");
  const [match, setMatch] = useState(null);
  const [checking, setChecking] = useState(false);
  const [matched, setMatched] = useState([]);
  const [myId, setMyId] = useState(null);
  const [permissionOk, setPermissionOk] = useState(false);
  const checkTimer = React.useRef(null);

  // Load my id + matched contacts from phone
  useEffect(() => {
    const load = async () => {
      try {
        const Contacts = require("expo-contacts");

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        setMyId(user.id);

        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== "granted") return;
        setPermissionOk(true);

        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
        });

        if (!data || data.length === 0) return;

        const emails = [];
        for (const c of data) {
          (c.emails || []).forEach((e) => {
            if (e.email) emails.push(e.email.toLowerCase().trim());
          });
        }
        if (emails.length === 0) return;

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .neq("id", user.id)
          .in("email", emails.slice(0, 500));

        setMatched(profiles || []);
      } catch (err) {
        console.log("contact load:", err?.message);
      }
    };
    load();
  }, []);

  // Live check the typed phone number
  useEffect(() => {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    setMatch(null);

    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 7) return;

    setChecking(true);
    checkTimer.current = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, phone")
          .ilike("phone", `%${cleaned}%`)
          .limit(1)
          .maybeSingle();

        setMatch(data || null);
      } catch {}
      setChecking(false);
    }, 500);

    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
  }, [phone]);

  const startChat = async (other) => {
    if (!myId) return;

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user_a.eq.${myId},user_b.eq.${other.id}),and(user_a.eq.${other.id},user_b.eq.${myId})`
      )
      .maybeSingle();

    let conversationId = existing?.id;
    if (!conversationId) {
      const [a, b] = myId < other.id ? [myId, other.id] : [other.id, myId];
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ user_a: a, user_b: b })
        .select("id")
        .single();

      if (error) {
        Alert.alert("Chat error", error.message);
        return;
      }
      conversationId = created.id;
    }

    close();
    setTimeout(() => {
      openModal("conversation", {
        id: conversationId,
        name: other.display_name || other.username,
        username: other.username,
        avatar: other.avatar_url || "https://i.pravatar.cc/300?img=68",
        otherUserId: other.id,
      });
    }, 250);
  };

  const saveToPhone = async () => {
    if (!match) return;
    try {
      if (permissionOk) {
        const Contacts = require("expo-contacts");
        await Contacts.addContactAsync({
          name: match.display_name || match.username,
          contactType: "person",
          phoneNumbers: phone.trim()
            ? [{ label: "mobile", number: phone.trim() }]
            : [],
        });
      }
      Alert.alert(
        "Contact saved",
        `${match.display_name || match.username} added to your phone.`,
        [
          { text: "OK", onPress: () => close() },
          {
            text: "Open chat",
            onPress: () => startChat(match),
          },
        ]
      );
    } catch (err) {
      Alert.alert("Save failed", err?.message || "Try again.");
    }
  };

  return (
    <View style={{ maxHeight: 560 }}>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text
          style={{
            color: OZAGU.muted,
            fontSize: 13,
            marginBottom: 16,
            lineHeight: 19,
          }}
        >
          Enter a phone number to see if that person is on OZAGU.
        </Text>

        {/* Phone input */}
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          placeholderTextColor={OZAGU.muted}
          keyboardType="phone-pad"
          autoFocus
          style={styles.formInput}
        />

        {/* Live status */}
        <View style={{ minHeight: 40, marginTop: -4 }}>
          {checking ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <ActivityIndicator size="small" color={OZAGU.purple} />
              <Text style={{ color: OZAGU.muted, fontSize: 12 }}>
                Checking…
              </Text>
            </View>
          ) : match ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginTop: 4,
              }}
            >
              <Avatar
                uri={
                  match.avatar_url || "https://i.pravatar.cc/300?img=68"
                }
                size={36}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: OZAGU.green,
                    fontSize: 12,
                    fontWeight: "800",
                  }}
                >
                  ✓ This contact is on OZAGU
                </Text>
                <Text
                  style={{
                    color: OZAGU.white,
                    fontSize: 13,
                    fontWeight: "700",
                    marginTop: 2,
                  }}
                >
                  {match.display_name || match.username}{" "}
                  <Text style={{ color: OZAGU.muted, fontWeight: "400" }}>
                    @{match.username}
                  </Text>
                </Text>
              </View>
            </View>
          ) : phone.replace(/\D/g, "").length >= 7 ? (
            <Text
              style={{
                color: OZAGU.muted,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Not on OZAGU yet
            </Text>
          ) : null}
        </View>

        {/* Action buttons */}
        {match ? (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <Pressable
              onPress={() => startChat(match)}
              style={[styles.primaryButton, { flex: 1 }]}
            >
              <Text style={styles.primaryButtonText}>Message</Text>
            </Pressable>

            <Pressable
              onPress={saveToPhone}
              style={{
                flex: 1,
                borderRadius: 15,
                backgroundColor: OZAGU.surface2,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 14,
              }}
            >
              <Text
                style={{
                  color: OZAGU.white,
                  fontWeight: "700",
                  fontSize: 13,
                }}
              >
                Save to phone
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Already-on-OZAGU contacts from phone */}
        {matched.length > 0 ? (
          <View style={{ marginTop: 30 }}>
            <Text
              style={{
                color: OZAGU.muted,
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              ON OZAGU FROM YOUR CONTACTS
            </Text>

            {matched.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => startChat(item)}
                style={styles.modalUserRow}
              >
                <Avatar
                  uri={
                    item.avatar_url || "https://i.pravatar.cc/300?img=68"
                  }
                  size={44}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalUserName}>
                    {item.display_name || item.username}
                  </Text>
                  <Text style={styles.modalUserUsername}>
                    @{item.username}
                  </Text>
                </View>
                <Ionicons
                  name="chatbubble-outline"
                  size={20}
                  color={OZAGU.violet}
                />
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function PhoneContactsList({ close, openModal }) {
  const [matched, setMatched] = useState([]);
const [loading, setLoading] = useState(true);
 const [permissionDenied, setPermissionDenied] = useState(false);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const Contacts = require("expo-contacts");

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        setMyId(user.id);

        // 1. Ask permission to read contacts
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== "granted") {
          setPermissionDenied(true);
          setLoading(false);
          return;
        }

        // 2. Read phone contacts
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Emails,
            Contacts.Fields.Name,
          ],
        });

        if (!data || data.length === 0) {
          setMatched([]);
          setLoading(false);
          return;
        }

        // 3. Collect all emails from contacts
        const emails = [];
        for (const c of data) {
          (c.emails || []).forEach((e) => {
            if (e.email) emails.push(e.email.toLowerCase().trim());
          });
        }

        if (emails.length === 0) {
          setMatched([]);
          setLoading(false);
          return;
        }

        // 4. Match against OZAGU profiles by email
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, email")
          .neq("id", user.id)
          .in("email", emails.slice(0, 500));

        setMatched(profiles || []);
      } catch (err) {
        console.log("Contacts error:", err?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const startChat = async (other) => {
    if (!myId) return;

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user_a.eq.${myId},user_b.eq.${other.id}),and(user_a.eq.${other.id},user_b.eq.${myId})`
      )
      .maybeSingle();

    let conversationId = existing?.id;

    if (!conversationId) {
      const [a, b] = myId < other.id ? [myId, other.id] : [other.id, myId];
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ user_a: a, user_b: b })
        .select("id")
        .single();

      if (error) {
        Alert.alert("Chat error", error.message);
        return;
      }
      conversationId = created.id;
    }

    close();
    setTimeout(() => {
      openModal("conversation", {
        id: conversationId,
        name: other.display_name || other.username,
        username: other.username,
        avatar: other.avatar_url || "https://i.pravatar.cc/300?img=68",
        otherUserId: other.id,
      });
    }, 250);
  };

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: "center" }}>
        <ActivityIndicator color={OZAGU.purple} />
        <Text style={{ color: OZAGU.muted, marginTop: 12, fontSize: 13 }}>
          Reading contacts…
        </Text>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View style={{ padding: 30, alignItems: "center" }}>
        <Ionicons name="person-outline" size={40} color={OZAGU.red} />
        <Text
          style={{
            color: OZAGU.white,
            marginTop: 12,
            textAlign: "center",
            fontSize: 14,
          }}
        >
          OZAGU needs permission to read your contacts to find friends.
        </Text>
      </View>
    );
  }

  if (matched.length === 0) {
    return (
      <View style={{ padding: 30, alignItems: "center" }}>
        <Ionicons name="people-outline" size={40} color={OZAGU.muted} />
        <Text
          style={{
            color: OZAGU.muted,
            marginTop: 12,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          None of your contacts are on OZAGU yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 18 }}>
      <Text
        style={{
          color: OZAGU.muted,
          fontSize: 12,
          marginBottom: 12,
        }}
      >
        {matched.length} of your contacts are on OZAGU
      </Text>

      <FlatList
        data={matched}
        keyExtractor={(item) => item.id}
        style={{ maxHeight: 420 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.modalUserRow}
            onPress={() => startChat(item)}
          >
            <Avatar
              uri={item.avatar_url || "https://i.pravatar.cc/300?img=68"}
              size={44}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.modalUserName}>
                {item.display_name || item.username}
              </Text>
              <Text style={styles.modalUserUsername}>@{item.username}</Text>
            </View>
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={OZAGU.violet}
            />
          </Pressable>
        )}
      />
    </View>
  );
}

function AppModal({
  modal,
  close,
  navigate,
  openModal,
}) {
    const [editUsername, setEditUsername] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // ============================================================
  // CREATE POST STATE
  // ============================================================

  const [postText, setPostText] = useState("");
  const [posting, setPosting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);


  // ============================================================
  // PHOTO FROM GALLERY
  // ============================================================

  const pickPhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "OZAGU needs access to your gallery so you can choose a photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    setSelectedMedia({
      uri: asset.uri,
      type: "image",
      mimeType: asset.mimeType || "image/jpeg",
      fileName: asset.fileName || `photo_${Date.now()}.jpg`,
    });
  };


  // ============================================================
  // VIDEO FROM GALLERY
  // ============================================================

  const pickVideo = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "OZAGU needs access to your gallery so you can choose a video."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    setSelectedMedia({
      uri: asset.uri,
      type: "video",
      mimeType: asset.mimeType || "video/mp4",
      fileName: asset.fileName || `video_${Date.now()}.mp4`,
    });
  };


  // ============================================================
  // CAMERA
  // ============================================================

  const openCamera = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "OZAGU needs camera access so you can take a photo or record a video."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    const isVideo =
      asset.type === "video" ||
      asset.mimeType?.startsWith("video/");

    setSelectedMedia({
      uri: asset.uri,
      type: isVideo ? "video" : "image",
      mimeType:
        asset.mimeType ||
        (isVideo ? "video/mp4" : "image/jpeg"),
      fileName:
        asset.fileName ||
        `${isVideo ? "video" : "photo"}_${Date.now()}.${
          isVideo ? "mp4" : "jpg"
        }`,
    });
  };


  // ============================================================
  // REMOVE SELECTED MEDIA
  // ============================================================

  const removeSelectedMedia = () => {
    setSelectedMedia(null);
  };


  // ============================================================
  // UPLOAD MEDIA + CREATE POST
  // ============================================================

  const publishPost = async () => {
    const trimmedText = postText.trim();

    if ((!trimmedText && !selectedMedia) || posting) {
      return;
    }

    setPosting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        Alert.alert("OZAGU", userError.message);
        return;
      }

      if (!user) {
        Alert.alert("OZAGU", "Please log in first.");
        return;
      }

      let mediaUrl = null;
      let mediaType = null;

      // --------------------------------------------------------
      // UPLOAD PHOTO OR VIDEO
      // --------------------------------------------------------

      if (selectedMedia) {
        const extension =
          selectedMedia.type === "video"
            ? "mp4"
            : "jpg";

        const safeFileName =
          selectedMedia.fileName ||
          `${selectedMedia.type}_${Date.now()}.${extension}`;

        const filePath =
          `${user.id}/${Date.now()}_${safeFileName.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          )}`;

        const response = await fetch(selectedMedia.uri);

        if (!response.ok) {
          throw new Error("Could not read the selected media.");
        }

        const fileBlob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from("ozagu-media")
          .upload(filePath, fileBlob, {
            contentType:
              selectedMedia.mimeType ||
              (selectedMedia.type === "video"
                ? "video/mp4"
                : "image/jpeg"),
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("ozagu-media")
          .getPublicUrl(filePath);

        mediaUrl = publicUrlData.publicUrl;
        mediaType = selectedMedia.type;
      }


      // --------------------------------------------------------
      // CREATE POST
      // --------------------------------------------------------

      const { data: newPost, error: postError } =
        await supabase
          .from("posts")
          .insert({
            user_id: user.id,
            content: trimmedText || null,
          })
          .select()
          .single();

      if (postError) {
        throw postError;
      }


      // --------------------------------------------------------
      // CREATE MEDIA RECORD
      // --------------------------------------------------------

      if (mediaUrl) {
        const { error: mediaError } = await supabase
          .from("media")
          .insert({
            post_id: newPost.id,
            user_id: user.id,
            media_url: mediaUrl,
            media_type: mediaType,
          });

        if (mediaError) {
          throw mediaError;
        }
      }


      // --------------------------------------------------------
      // RESET
      // --------------------------------------------------------

      const completePost = {
        ...newPost,

        likes: 0,
        comments: 0,
        shares: 0,
        liked: false,
        saved: false,
        following: false,

        media: mediaUrl
          ? [
              {
                media_url: mediaUrl,
                media_type: mediaType,
              },
            ]
          : [],
      };

      setPostText("");
setSelectedMedia(null);
close();

// ✅ FIX: capture modal.data before close()
if (modal?.data?.onCreated) {
  modal.data.onCreated(completePost);
}

    } catch (error) {
      Alert.alert(
        "Post failed",
        error?.message || "Something went wrong while publishing your post."
      );
    } finally {
      setPosting(false);
    }
  };
  useEffect(() => {
    if (modal?.type === "editProfile" && modal.data?.profile) {
      setEditUsername(modal.data.profile.username || "");
      setEditDisplayName(modal.data.profile.display_name || "");
      setEditBio(modal.data.profile.bio || "");
      setEditAvatarUrl(modal.data.profile.avatar_url || "");
    }
  }, [modal]);

  if (!modal) return null;

  const type = modal.type;
  const data = modal.data;

  if (type === "closeAI") {
    close();
    return null;
  }

  let title = "OZAGU";

  if (type === "search") title = "Search";
  if (type === "comments") title = "Comments";
  if (type === "share") title = "Share";
  if (type === "createPost") title = "Create post";
  if (type === "postMenu") title = "Post";
  if (type === "tvMenu") title = "TV";
  if (type === "profile") title = "Profile";
  if (type === "story") title = data?.name || "Story";
  if (type === "conversation") title = data?.name || "Chat";
  if (type === "newChat") title = "New chat";
  if (type === "newChatOptions") title = "New chat";
if (type === "phoneContacts") title = "Contacts";
if (type === "addContact") title = "New contact";
if (type === "createGroup") title = "New group";
if (type === "groupChat") title = data?.name || "Group";
  if (type === "product") title = data?.title || "Product";
  if (type === "createListing") title = "Create listing";
  if (type === "category") title = data?.category || "Category";
  if (type === "notificationSettings") title = "Notification settings";
  if (type === "notification") title = "Notification";
  if (type === "editProfile") title = "Edit profile";
  if (type === "profileShare") title = "Share profile";
  if (type === "menuPage") title = data?.title || "OZAGU";
  if (type === "aiHistory") title = "AI history";

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>

            <Pressable onPress={close}>
              <Text style={styles.modalClose}>×</Text>
            </Pressable>
          </View>

{type === "newChatOptions" && (
  <NewChatOptions close={close} openModal={openModal} />
)}

{type === "phoneContacts" && (
  <PhoneContactsList close={close} openModal={openModal} />
)}

{type === "addContact" && (
  <AddContactScreen close={close} openModal={openModal} />
)}

{type === "createGroup" && (
  <CreateGroupScreen
    onClose={close}
    onCreated={(group) => {
      close();
      setTimeout(() => {
        openModal("groupChat", group);
      }, 250);
    }}
  />
)}

{type === "groupChat" && (
  <GroupChatView group={data} onClose={close} />
)}
{type === "newChat" && (
  <NewChatList close={close} openModal={openModal} />
)}
{type === "conversation" && (
  <ConversationView chat={data} close={close} />
)}
          {type === "search" && (
            <View style={styles.modalBody}>
              <View style={styles.modalSearch}>
                <Ionicons name="search-outline" size={20} color={OZAGU.muted} style={{ marginRight: 7 }} />
                <TextInput
                  autoFocus
                  placeholder="Search OZAGU"
                  placeholderTextColor={OZAGU.muted}
                  style={styles.modalSearchInput}
                />
              </View>

              <Text style={styles.modalHint}>
                Search people, posts, videos and marketplace listings.
              </Text>
            </View>
          )}

          {type === "comments" && (
            <View style={styles.modalBody}>
              <Text style={styles.modalLargeNumber}>
                {data?.comments || 0} comments
              </Text>

              <View style={styles.commentInput}>
                <Avatar uri={AVATARS.user} size={38} />

                <TextInput
                  placeholder="Write a comment..."
                  placeholderTextColor={OZAGU.muted}
                  style={styles.commentTextInput}
                />

                <Pressable>
                  <Text style={styles.commentSend}>↑</Text>
                </Pressable>
              </View>
            </View>
          )}

          {type === "share" && (
            <View style={styles.modalBody}>
              {[
                ["↗", "Share to OZAGU"],
                ["◉", "Send to a friend"],
                ["▣", "Copy link"],
                ["●", "More options"],
              ].map(([icon, label]) => (
                <Pressable key={label} style={styles.modalOption}>
                  <View style={styles.modalOptionIcon}>
                    <Text style={styles.modalOptionIconText}>{icon}</Text>
                  </View>
                  <Text style={styles.modalOptionText}>{label}</Text>
                </Pressable>
              ))}
            </View>
          )}
  
  // ============================================================
// CREATE POST
// ============================================================

{type === "createPost" && (
  <View style={styles.modalBody}>

    {/* CREATE POST HEADER */}

    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <Avatar uri={AVATARS.user} size={46} />

      <View style={{ marginLeft: 10 }}>
        <Text
          style={{
            color: OZAGU.white,
            fontSize: 15,
            fontWeight: "700",
          }}
        >
          Create a post
        </Text>

        <Text
          style={{
            color: OZAGU.muted,
            fontSize: 12,
            marginTop: 2,
          }}
        >
          Share something with OZAGU
        </Text>
      </View>
    </View>


    {/* TEXT */}

    <TextInput
      autoFocus
      multiline
      value={postText}
      onChangeText={setPostText}
      placeholder="What's on your mind?"
      placeholderTextColor={OZAGU.muted}
      style={{
        backgroundColor: OZAGU.surface2,
        color: OZAGU.white,
        minHeight: 150,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        textAlignVertical: "top",
        marginBottom: 14,
      }}
    />


    {/* SELECTED MEDIA PREVIEW */}

    {selectedMedia && (
      <View
        style={{
          marginBottom: 14,
          borderRadius: 14,
          overflow: "hidden",
          backgroundColor: OZAGU.surface2,
        }}
      >

        {selectedMedia.type === "image" ? (
          <Image
            source={{ uri: selectedMedia.uri }}
            style={{
              width: "100%",
              height: 220,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              height: 150,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: OZAGU.surface2,
            }}
          >
            <Ionicons
              name="videocam"
              size={48}
              color={OZAGU.white}
            />

            <Text
              style={{
                color: OZAGU.white,
                marginTop: 8,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              Video selected
            </Text>
          </View>
        )}

        <Pressable
          onPress={removeSelectedMedia}
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: "rgba(0,0,0,0.75)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="close"
            size={21}
            color={OZAGU.white}
          />
        </Pressable>

      </View>
    )}


    {/* CREATE OPTIONS — 2 × 2 */}

    <View
      style={{
        marginBottom: 16,
      }}
    >

      {/* ROW 1 */}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >

        {/* PHOTO */}

        <Pressable
          onPress={pickPhoto}
          style={{
            width: "48%",
            backgroundColor: OZAGU.surface2,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Ionicons
            name="image-outline"
            size={22}
            color={OZAGU.white}
          />

          <Text
            style={{
              color: OZAGU.white,
              fontSize: 11,
              marginTop: 5,
            }}
          >
            Photo
          </Text>
        </Pressable>


        {/* VIDEO */}

        <Pressable
          onPress={pickVideo}
          style={{
            width: "48%",
            backgroundColor: OZAGU.surface2,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Ionicons
            name="videocam-outline"
            size={22}
            color={OZAGU.white}
          />

          <Text
            style={{
              color: OZAGU.white,
              fontSize: 11,
              marginTop: 5,
            }}
          >
            Video
          </Text>
        </Pressable>

      </View>


      {/* ROW 2 */}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >

        {/* CAMERA */}

        <Pressable
          onPress={openCamera}
          style={{
            width: "48%",
            backgroundColor: OZAGU.surface2,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Ionicons
            name="camera-outline"
            size={22}
            color={OZAGU.white}
          />

          <Text
            style={{
              color: OZAGU.white,
              fontSize: 11,
              marginTop: 5,
            }}
          >
            Camera
          </Text>
        </Pressable>


        {/* FEELING */}

        <Pressable
          style={{
            width: "48%",
            backgroundColor: OZAGU.surface2,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Ionicons
            name="happy-outline"
            size={22}
            color={OZAGU.white}
          />

          <Text
            style={{
              color: OZAGU.white,
              fontSize: 11,
              marginTop: 5,
            }}
          >
            Feeling
          </Text>
        </Pressable>

      </View>

    </View>


    {/* POST BUTTON */}

    <Pressable
      disabled={
        posting ||
        (!postText.trim() && !selectedMedia)
      }
      style={{
        backgroundColor:
          postText.trim() || selectedMedia
            ? OZAGU.red
            : OZAGU.white,

        borderRadius: 14,
        paddingVertical: 15,
        alignItems: "center",
      }}
      onPress={publishPost}
    >
      {posting ? (
        <ActivityIndicator
          color={
            postText.trim() || selectedMedia
              ? OZAGU.white
              : "#111111"
          }
        />
      ) : (
        <Text
          style={{
            color:
              postText.trim() || selectedMedia
                ? OZAGU.white
                : "#111111",
            fontSize: 15,
            fontWeight: "700",
          }}
        >
          Post
        </Text>
      )}
    </Pressable>

  </View>
)}


{/* POST MENU */}

{type === "postMenu" && (
  <View style={styles.modalBody}>
    {[
      "Save post",
      "Turn on notifications",
      "Report post",
      "Cancel",
    ].map((label) => (
      <Pressable
        key={label}
        style={styles.modalOption}
      >
        <Text style={styles.modalOptionText}>
          {label}
        </Text>
      </Pressable>
    ))}
  </View>
)}


{/* TV MENU */}

{type === "tvMenu" && (
  <View style={styles.modalBody}>
    {[
      "Not interested",
      "Save video",
      "Report video",
      "Copy link",
      "Download video",
    ].map((label) => (
      <Pressable
        key={label}
        style={styles.modalOption}
      >
        <Text style={styles.modalOptionText}>
          {label}
        </Text>
      </Pressable>
    ))}
  </View>
)}


{/* PRODUCT */}

{type === "product" && (
  <View style={styles.modalBody}>

    <Image
      source={{ uri: data?.image }}
      style={styles.productModalImage}
    />

    <Text style={styles.productModalTitle}>
      {data?.title}
    </Text>

    <Text style={styles.productModalPrice}>
      {data?.price}
    </Text>

    <Text style={styles.productModalSeller}>
      Seller: {data?.seller}
    </Text>

    <Pressable
      style={styles.primaryButton}
      onPress={() =>
        Alert.alert(
          "OZAGU Marketplace",
          "Message seller feature ready for backend connection."
        )
      }
    >
      <Text style={styles.primaryButtonText}>
        Message seller
      </Text>
    </Pressable>

  </View>
)}


{/* CREATE LISTING */}

{type === "createListing" && (
  <View style={styles.modalBody}>

    <TextInput
      placeholder="Product name"
      placeholderTextColor={OZAGU.muted}
      style={styles.formInput}
    />

    <TextInput
      placeholder="Price"
      placeholderTextColor={OZAGU.muted}
      style={styles.formInput}
    />

    <TextInput
      placeholder="Description"
      placeholderTextColor={OZAGU.muted}
      style={[styles.formInput, styles.formLarge]}
      multiline
    />

    <Pressable
      style={styles.primaryButton}
      onPress={() =>
        Alert.alert(
          "OZAGU",
          "Listing form ready for Supabase connection."
        )
      }
    >
      <Text style={styles.primaryButtonText}>
        Create listing
      </Text>
    </Pressable>

  </View>
)}


{/* CATEGORY */}

{type === "category" && (
  <View style={styles.modalBody}>

    <Text style={styles.modalHint}>
      Showing marketplace category:
    </Text>

    <Text style={styles.categoryModalTitle}>
      {data?.category}
    </Text>

  </View>
)}


{/* NOTIFICATION SETTINGS */}

{type === "notificationSettings" && (
  <View style={styles.modalBody}>

    {[
      "Likes",
      "Comments",
      "New followers",
      "Messages",
      "Marketplace",
    ].map((label) => (
      <View
        key={label}
        style={styles.settingRow}
      >
        <Text style={styles.settingLabel}>
          {label}
        </Text>

        <Text style={styles.settingToggle}>
          ON
        </Text>
      </View>
    ))}

  </View>
)}


{/* NOTIFICATION */}

{type === "notification" && (
  <View style={styles.modalBody}>

    <Avatar
      uri={data?.avatar}
      size={70}
    />

    <Text style={styles.notificationModalText}>
      {data?.text}
    </Text>

    <Text style={styles.notificationTime}>
      {data?.time}
    </Text>

  </View>
)}


{/* EDIT PROFILE */}

{type === "editProfile" && (
  <View style={styles.modalBody}>

    {editAvatarUrl ? (
      <View
        style={{
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Avatar
          uri={editAvatarUrl}
          size={80}
          border
        />
      </View>
    ) : null}

    <TextInput
      style={styles.formInput}
      placeholder="Avatar image URL"
      placeholderTextColor={OZAGU.muted}
      value={editAvatarUrl}
      onChangeText={setEditAvatarUrl}
      autoCapitalize="none"
    />

    <TextInput
      style={styles.formInput}
      placeholder="Display name"
      placeholderTextColor={OZAGU.muted}
      value={editDisplayName}
      onChangeText={setEditDisplayName}
    />

    <TextInput
      style={styles.formInput}
      placeholder="Username"
      placeholderTextColor={OZAGU.muted}
      value={editUsername}
      onChangeText={setEditUsername}
      autoCapitalize="none"
    />

    <TextInput
      placeholder="Bio"
      placeholderTextColor={OZAGU.muted}
      style={[
        styles.formInput,
        styles.formLarge,
      ]}
      value={editBio}
      onChangeText={setEditBio}
      multiline
    />

    <Pressable
      style={styles.primaryButton}
      disabled={savingProfile}
      onPress={async () => {
        setSavingProfile(true);

        const ok = await data?.onSave?.({
          username: editUsername,
          displayName: editDisplayName,
          bio: editBio,
          avatarUrl: editAvatarUrl,
        });

        setSavingProfile(false);

        if (ok) close();
      }}
    >
      {savingProfile ? (
        <ActivityIndicator
          color={OZAGU.white}
        />
      ) : (
        <Text style={styles.primaryButtonText}>
          Save changes
        </Text>
      )}
    </Pressable>

  </View>
)}


{/* PROFILE SHARE */}

{type === "profileShare" && (
  <View style={styles.modalBody}>

    <Text style={styles.modalHint}>
      Share your OZAGU profile with others.
    </Text>

    <View style={styles.shareProfileBox}>
      <Text style={styles.shareProfileText}>
        ozagu.com/@username
      </Text>
    </View>

    <Pressable
      style={styles.primaryButton}
      onPress={() =>
        Alert.alert(
          "OZAGU",
          "Profile link copied."
        )
      }
    >
      <Text style={styles.primaryButtonText}>
        Copy profile link
      </Text>
    </Pressable>

  </View>
)}


{/* MENU PAGE */}

{type === "menuPage" && (
  <View style={styles.modalBody}>

    <Text style={styles.modalHint}>
      {data?.title} is ready for the next OZAGU feature layer.
    </Text>

  </View>
)}


{/* AI HISTORY */}

{type === "aiHistory" && (
  <AIHistoryList
    onSelect={(id) => {
      data?.onSelect?.(id);
      close();
    }}
  />
)}

        </View>
      </View>
    </Modal>
  );
}
          

              

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
      const handleAuth = async () => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();
  if (!cleanEmail || !password) {
    Alert.alert(
      "Missing information",
      "Enter your email and password."
    );
    return;
  }
  if (mode === "signup" && !cleanUsername) {
    Alert.alert(
      "Missing username",
      "Choose a username for your OZAGU account."
    );
    return;
  }
  if (password.length < 6) {
    Alert.alert(
      "Password too short",
      "Your password must contain at least 6 characters."
    );
    return;
  }
  setLoading(true);
  try {
    const authRequest =
      mode === "signup"
        ? supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                username: cleanUsername,
                display_name: cleanUsername,
              },
            },
          })
        : supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
    const timeout = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Supabase authentication is taking too long. Please check your internet connection and try again."
            )
          ),
        15000
      )
    );
    const { data, error } = await Promise.race([
      authRequest,
      timeout,
    ]);
    if (error) {
      throw error;
    }

    if (mode === "signup") {
      if (data?.session) {
        onAuthenticated(data.session);
        return;
      }

      Alert.alert(
        "Account created",
        "Your OZAGU account has been created. Check your email to verify your account, then sign in."
      );

      setMode("login");
      return;
    }

    if (!data?.session) {
      throw new Error(
        "No session was returned. Please try signing in again."
      );
    }

    onAuthenticated(data.session);
  } catch (error) {
    Alert.alert(
      mode === "signup" ? "Sign Up Failed" : "Sign In Failed",
      error?.message ||
        "Unable to connect to OZAGU authentication."
    );
  } finally {
    setLoading(false);
  }
};
        return (
    <KeyboardAvoidingView
      style={authStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={authStyles.glow} />
      <View style={authStyles.content}>
        <Image
  source={{
    uri: "https://wtfuefyzoopllgmusfbp.supabase.co/storage/v1/object/public/ozagu-media/file_00000000bef0820a8f48b182d2ee6a5e.png",
  }}
  style={authStyles.logoImage}
  resizeMode="contain"
/>
        <Text style={authStyles.title}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </Text>
        <Text style={authStyles.subtitle}>
          {mode === "login"
            ? "Sign in to continue to OZAGU."
            : "Join OZAGU and create your world."}
        </Text>
        {mode === "signup" && (
          <TextInput
            style={authStyles.input}
            placeholder="Username"
            placeholderTextColor={OZAGU.muted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}
        <TextInput
          style={authStyles.input}
          placeholder="Email"
          placeholderTextColor={OZAGU.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={authStyles.input}
          placeholder="Password"
          placeholderTextColor={OZAGU.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Pressable
          style={authStyles.primaryButton}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={authStyles.primaryButtonText}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </Text>
          )}
        </Pressable>
        <Pressable
          style={authStyles.switchButton}
          onPress={() =>
            setMode(mode === "login" ? "signup" : "login")
          }
        >
          <Text style={authStyles.switchText}>
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <Text style={authStyles.switchAccent}>
              {mode === "login" ? "Sign Up" : "Sign In"}
            </Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OZAGU.background,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 28,
    width: "100%",
  },
  glow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(124, 58, 237, 0.12)",
    top: "18%",
    alignSelf: "center",
  },
  logo: {
    color: OZAGU.white,
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: 36,
    fontFamily: "SpaceGrotesk-Bold",
  },
  title: {
    color: OZAGU.white,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "SpaceGrotesk-Bold",
  },
  subtitle: {
    color: OZAGU.muted,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    height: 54,
    backgroundColor: OZAGU.surface,
    borderWidth: 1,
    borderColor: OZAGU.border,
    borderRadius: 14,
    color: OZAGU.white,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 14,
  },

  primaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: OZAGU.violet,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  primaryButtonText: {
    color: OZAGU.white,
    fontSize: 16,
    fontWeight: "700",
  },

  switchButton: {
    alignItems: "center",
    marginTop: 22,
  },

  switchText: {
    color: OZAGU.muted,
    fontSize: 14,
  },

  switchAccent: {
    color: OZAGU.purple,
    fontWeight: "700",
  },
});
export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
const [minSplashDone, setMinSplashDone] = useState(false);

useEffect(() => {
  const t = setTimeout(() => setMinSplashDone(true), 1500);
  return () => clearTimeout(t);
}, []);
  const [fontsLoaded] = useFonts({
  "SpaceGrotesk-Regular": {
    uri: "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2",
  },
  "SpaceGrotesk-Bold": {
    uri: "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbwCw.woff2",
  },
});
  useEffect(() => {
    let mounted = true;
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setAuthLoading(false);
      }
    };
    loadSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  const [activeTab, setActiveTab] = useState("tv");
  const [previousTab, setPreviousTab] = useState("tv");
  const [isDark, setIsDark] = useState(true);
  const { client: streamClient, loading: streamLoading } = useStreamClient(session);
const theme = isDark ? OZAGU : OZAGU_LIGHT;
const toggleTheme = () => setIsDark((v) => !v);
  const [posts, setPosts] = useState([]);
  const [tvItems, setTvItems] = useState(INITIAL_TV);
  
   [modal, setModal] = useState(null);
  // ============================================================
// ENCRYPTION LOCK STATE
// keyState: "checking" | "setup" | "locked" | "unlocked"
// ============================================================
const [keyState, setKeyState] = useState("checking");
const [backgroundedAt, setBackgroundedAt] = useState(null);

// Check key status when session becomes available
useEffect(() => {
  if (!session?.user?.id) return;

  const check = async () => {
    try {
      const { getCachedPrivateKey } = require("./crypto");
      const cached = await getCachedPrivateKey();
      if (cached) {
        setKeyState("unlocked");
        return;
      }

      const { data } = await supabase
        .from("user_keys")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setKeyState(data ? "locked" : "setup");
    } catch {
      setKeyState("setup");
    }
  };

  check();
}, [session]);

// Auto-lock after 5 minutes in background
useEffect(() => {
  const sub = AppState.addEventListener("change", async (next) => {
    if (next === "background" || next === "inactive") {
      setBackgroundedAt(Date.now());
    } else if (next === "active" && backgroundedAt) {
      const elapsed = Date.now() - backgroundedAt;
      setBackgroundedAt(null);
      if (elapsed > 5 * 60 * 1000) {
        try {
          const { clearCachedPrivateKey } = require("./crypto");
          await clearCachedPrivateKey();
        } catch {}
        setKeyState("locked");
      }
    }
  });
  return () => sub.remove();
}, [backgroundedAt]);

const manualLock = async () => {
  try {
    const { clearCachedPrivateKey } = require("./crypto");
    await clearCachedPrivateKey();
  } catch {}
  setKeyState("locked");
};
  // Load real posts from Supabase once the user is authenticated
  useEffect(() => {
    if (!session?.user?.id) return;
    fetchPosts(session.user.id)
      .then(setPosts)
      .catch((err) =>
        Alert.alert("Error loading posts", err.message)
      );
  }, [session]);
  const navigate = (tab) => {
  if (tab === "previous") {
    setActiveTab(previousTab);
    return;
  }
  setActiveTab(tab);
};
  ozaguNavigate = navigate;
  const openModal = (type, data = null) => {
  if (type === "ai") {
    setPreviousTab(activeTab);
    setModal(null);
    setActiveTab("ai");
    return;
  }
  setModal({ type, data });
};
  const closeModal = () => {
    setModal(null);
  };
  const renderScreen = () => {
  switch (activeTab) {
    case "home":
      return (
        <HomeScreen
          posts={posts}
          setPosts={setPosts}
          openModal={openModal}
          navigate={navigate}
        />
      );
    case "tv":
      return (
        <TVScreen
          tvItems={tvItems}
          setTvItems={setTvItems}
          openModal={openModal}
        />
      );
    case "chat":
  return <ChatScreen openModal={openModal} onLock={manualLock} />;
    case "syncalot":
      return <SyncalotScreen openModal={openModal} />;
    case "alerts":
      return <AlertsScreen openModal={openModal} />;
    case "market":
      return <MarketplaceScreen openModal={openModal} />;
    case "me":
      return (
        <MeScreen
          openModal={openModal}
          navigate={navigate}
        />
      );

    case "ai":
      return <AIScreen
  openModal={openModal}
  navigate={navigate}
/>
case "editor":
  return (
    <VideoEditorScreen
      onClose={() => setActiveTab("home")}
      onPost={(data) => {
        Alert.alert(
          "Ready to post",
          "Video settings saved. Full editing (trim/filter/speed) will process during the EAS build."
        );
        setActiveTab("home");
      }}
    />
  );
    default:
      return (
        <HomeScreen
          posts={posts}
          setPosts={setPosts}
          openModal={openModal}
        />
      );
  }
};

  const isAI = activeTab === "ai";

if (authLoading || !fontsLoaded || !minSplashDone) {
  return (
    <View style={styles.app}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={OZAGU.background}
      />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={{
            uri: "https://wtfuefyzoopllgmusfbp.supabase.co/storage/v1/object/public/ozagu-media/file_00000000bef0820a8f48b182d2ee6a5e.png",
          }}
          style={{
            width: 180,
            height: 180,
            marginBottom: 20,
          }}
          resizeMode="contain"
        />

        <Text
          style={{
            color: OZAGU.white,
            fontSize: 22,
            fontWeight: "800",
            letterSpacing: 6,
            fontFamily: "SpaceGrotesk-Bold",
          }}
        >
          OZAGU
        </Text>

        <ActivityIndicator
          size="small"
          color={OZAGU.purple}
          style={{ marginTop: 20 }}
        />
      </View>
    </View>
  );
}
   if (!session) {
    return (
      <AuthScreen
        onAuthenticated={(newSession) => {
          setSession(newSession);
        }}
      />
    );
  }

  if (keyState === "checking") {
    return (
      <View style={styles.app}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={OZAGU.background}
        />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={OZAGU.purple} />
        </View>
      </View>
    );
  }

  if (keyState === "setup") {
    return (
      <ThemeContext.Provider value={{ theme, isDark, toggle: toggleTheme }}>
        <View style={[styles.app, { backgroundColor: theme.background }]}>
          <StatusBar
            barStyle={isDark ? "light-content" : "dark-content"}
            backgroundColor={theme.background}
            translucent={false}
          />
          <KeySetupScreen onComplete={() => setKeyState("unlocked")} />
        </View>
      </ThemeContext.Provider>
    );
  }

  if (keyState === "locked") {
    return (
      <ThemeContext.Provider value={{ theme, isDark, toggle: toggleTheme }}>
        <View style={[styles.app, { backgroundColor: theme.background }]}>
          <StatusBar
            barStyle={isDark ? "light-content" : "dark-content"}
            backgroundColor={theme.background}
            translucent={false}
          />
          <KeyUnlockScreen onUnlock={() => setKeyState("unlocked")} />
        </View>
      </ThemeContext.Provider>
    );
  }

  if (streamLoading || !streamClient) {
    return (
      <View style={styles.app}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={OZAGU.background}
        />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={OZAGU.purple} />
          <Text style={{ color: OZAGU.white, marginTop: 16 }}>
            Connecting to calls…
          </Text>
        </View>
      </View>
    );
  }

  return (
    <StreamVideo client={streamClient}>
      <ThemeContext.Provider value={{ theme, isDark, toggle: toggleTheme }}>
        <View style={[styles.app, { backgroundColor: theme.background }]}>
          <StatusBar
            barStyle={isDark ? "light-content" : "dark-content"}
            backgroundColor={theme.background}
            translucent={false}
          />

          {renderScreen()}

          {!isAI && (
<BottomNav
  active={activeTab}
  navigate={navigate}
  onCreatePost={() => setActiveTab("editor")}
/>
          )}

          <AppModal
            modal={modal}
            close={closeModal}
            navigate={navigate}
            openModal={openModal}
          />
        </View>
      </ThemeContext.Provider>
    </StreamVideo>
  );
}
const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: OZAGU.background,
  },
  screen: {
    flex: 1,
    backgroundColor: OZAGU.background,
  },
 fontRegular: { fontFamily: "SpaceGrotesk-Regular" },
fontBold:    { fontFamily: "SpaceGrotesk-Bold" }, 
  header: {
  minHeight: 190,
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 10,
  backgroundColor: OZAGU.background,
  borderBottomWidth: 1,
  borderBottomColor: OZAGU.border,
},
  logo: {
  color: OZAGU.white,
  fontSize: 25,
  fontWeight: "900",
  letterSpacing: 1,
  fontFamily: "SpaceGrotesk-Bold",
},
logoImage: {
  width: 140,
  height: 140,
  alignSelf: "center",
  marginBottom: 24,
},

  headerNotification: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: OZAGU.surface2,
    alignItems: "center",
    justifyContent: "center",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: OZAGU.surface2,
  },
  iconButtonActive: {
    backgroundColor: OZAGU.violet,
  },
  iconText: {
    color: OZAGU.white,
    fontSize: 19,
    fontWeight: "800",
  },
  iconTextActive: {
    color: OZAGU.white,
  },
  betaButton: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: OZAGU.surface2,
    borderWidth: 1,
    borderColor: OZAGU.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  betaStar: {
    color: OZAGU.purple,
    fontSize: 17,
  },
  betaText: {
    color: OZAGU.white,
    fontWeight: "800",
  },
  avatarOuter: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBorder: {
    borderWidth: 2,
    borderColor: OZAGU.purple,
  },
  storySection: {
    paddingTop: 14,
    paddingBottom: 12,
  },
  sectionTitle: {
    color: OZAGU.white,
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  storyScroll: {
    paddingHorizontal: 14,
    gap: 14,
  },
  storyItem: {
    width: 72,
    alignItems: "center",
  },
  storyRing: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: OZAGU.violet,
  },
  storyName: {
    color: OZAGU.white,
    fontSize: 11,
    marginTop: 5,
    maxWidth: 70,
  },
  feedContent: {
    paddingBottom: 105,
  },
  postCard: {
    marginHorizontal: 10,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: OZAGU.surface,
    borderWidth: 1,
    borderColor: OZAGU.border,
    overflow: "hidden",
  },
  postHeader: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postUser: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  postUserText: {
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  postAuthor: {
    color: OZAGU.white,
    fontSize: 14,
    fontWeight: "800",
  },
  verified: {
    color: OZAGU.white,
    backgroundColor: OZAGU.blue,
    fontSize: 10,
    fontWeight: "900",
    width: 15,
    height: 15,
    textAlign: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  username: {
    color: OZAGU.muted,
    fontSize: 12,
    marginTop: 2,
  },
  postHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  smallFollow: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: OZAGU.violet,
  },
  smallFollowText: {
    color: OZAGU.white,
    fontSize: 11,
    fontWeight: "800",
  },
  postText: {
    color: OZAGU.white,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  postImages: {
    width: "100%",
  },
  postImage: {
    width: SCREEN_WIDTH - 20,
    height: 300,
    resizeMode: "cover",
  },
  postStats: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statText: {
    color: OZAGU.muted,
    fontSize: 11,
  },
  postActions: {
    borderTopWidth: 1,
    borderTopColor: OZAGU.border,
    flexDirection: "row",
    paddingVertical: 8,
  },
  postAction: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  actionIcon: {
    color: OZAGU.white,
    fontSize: 20,
  },
  actionText: {
    color: OZAGU.muted,
    fontSize: 10,
  },
  liked: {
    color: OZAGU.red,
  },

  saved: {
    color: OZAGU.gold,
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    paddingBottom: 8,
    paddingTop: 7,
    backgroundColor: "#0D0D0D",
    borderTopWidth: 1,
    borderTopColor: OZAGU.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 100,
    elevation: 20,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconWrapActive: {
    backgroundColor: OZAGU.violet,
  },
  navIcon: {
    color: OZAGU.muted,
    fontSize: 19,
    fontWeight: "800",
  },
  navIconActive: {
    color: OZAGU.white,
  },
  navLabel: {
    color: OZAGU.muted,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
  navLabelActive: {
    color: OZAGU.white,
  },
  tvScreen: {
    flex: 1,
    backgroundColor: "#000",
  },
  tvCard: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 24,
    backgroundColor: "#000",
    position: "relative",
  },
  tvImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 24,
    resizeMode: "cover",
  },
  tvOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.32)",
  },
  tvTop: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tvIndex: {
    color: OZAGU.white,
    fontSize: 14,
    fontWeight: "900",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
  },
  tvBottom: {
    position: "absolute",
    left: 16,
    right: 12,
    bottom: 25,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  tvInfo: {
    flex: 1,
    paddingRight: 8,
  },
  tvAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tvAuthorInfo: {
    marginLeft: 9,
    flex: 1,
  },
  tvAuthor: {
    color: OZAGU.white,
    fontSize: 14,
    fontWeight: "900",
  },

  tvUsername: {
    color: "#DDD",
    fontSize: 11,
    marginTop: 2,
  },

  followButton: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: OZAGU.white,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  followingButton: {
    backgroundColor: OZAGU.white,
    borderColor: OZAGU.white,
  },

  followButtonText: {
    color: OZAGU.white,
    fontSize: 11,
    fontWeight: "900",
  },

  followingButtonText: {
    color: "#000",
  },
  tvTitle: {
    color: OZAGU.white,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 5,    
  fontFamily: "SpaceGrotesk-Bold",
  },
  tvCaption: {
    color: "#F2F2F2",
    fontSize: 14,
    lineHeight: 20,
  },
  soundRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  soundIcon: {
    color: OZAGU.white,
    fontSize: 14,
    marginRight: 6,
  },
  soundText: {
    color: "#DDD",
    fontSize: 11,
  },
  tvActions: {
    width: 58,
    alignItems: "center",
    marginBottom: 3,
  },
  tvAction: {
    alignItems: "center",
    marginVertical: 7,
  },
  tvActionIcon: {
    color: OZAGU.white,
    fontSize: 27,
    fontWeight: "800",
    textShadowColor: "#000",
    textShadowRadius: 5,
  },
  tvActionActive: {
    color: OZAGU.pink,
  },
  tvActionLabel: {
    color: OZAGU.white,
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2,
  },
  pageContent: {
    padding: 14,
    paddingBottom: 105,
  },
  chatSearch: {
    margin: 12,
    height: 44,
    backgroundColor: OZAGU.surface2,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIcon: {
    color: OZAGU.muted,
    fontSize: 22,
    marginRight: 7,
  },
  searchInput: {
    flex: 1,
    color: OZAGU.white,
    fontSize: 14,
  },
  chatRow: {
    minHeight: 72,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: OZAGU.border,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatName: {
    color: OZAGU.white,
    fontWeight: "800",
    fontSize: 15,
  },
  chatLast: {
    color: OZAGU.muted,
    marginTop: 4,
    fontSize: 12,
  },
  chatRight: {
    alignItems: "flex-end",
  },
  chatTime: {
    color: OZAGU.muted,
    fontSize: 10,
  },
  unread: {
    marginTop: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: OZAGU.violet,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: OZAGU.white,
    fontSize: 10,
    fontWeight: "900",
  },
  pageHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageTitle: {
    color: OZAGU.white,
    fontSize: 22,
    fontWeight: "900",    
  fontFamily: "SpaceGrotesk-Bold",
  },
  pageSubtitle: {
    color: OZAGU.muted,
    marginTop: 4,
    fontSize: 12,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: OZAGU.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsText: {
    color: OZAGU.white,
    fontSize: 19,
  },

  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: OZAGU.border,
  },

  notificationInfo: {
    flex: 1,
    marginLeft: 12,
  },

  notificationText: {
    color: OZAGU.white,
    fontSize: 13,
    lineHeight: 19,
  },

  notificationTime: {
    color: OZAGU.muted,
    fontSize: 10,
    marginTop: 5,
  },
  notificationArrow: {
    color: OZAGU.muted,
    fontSize: 27,
  },
  marketHeader: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sellButton: {
    backgroundColor: OZAGU.violet,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sellButtonText: {
    color: OZAGU.white,
    fontWeight: "900",
  },
  categoryScroll: {
    paddingHorizontal: 14,
    gap: 8,
    paddingBottom: 13,
  },
  categoryPill: {
    backgroundColor: OZAGU.surface2,
    borderWidth: 1,
    borderColor: OZAGU.border,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  categoryText: {
    color: OZAGU.white,
    fontSize: 11,
    fontWeight: "800",
  },
  marketContent: {
    paddingHorizontal: 10,
    paddingBottom: 105,
  },
  productColumns: {
    justifyContent: "space-between",
  },
  productCard: {
    width: "48.5%",
    backgroundColor: OZAGU.surface,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: OZAGU.border,
  },
  productImage: {
    width: "100%",
    height: 145,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 10,
  },
  productTitle: {
    color: OZAGU.white,
    fontSize: 13,
    fontWeight: "800",
  },
  productPrice: {
    color: OZAGU.gold,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 5,
  },
  productSeller: {
    color: OZAGU.muted,
    fontSize: 10,
    marginTop: 3,
  },
  meContent: {
    padding: 14,
    paddingBottom: 105,
  },
  profileCard: {
    alignItems: "center",
    padding: 18,
    backgroundColor: OZAGU.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: OZAGU.border,
  },
  profileName: {
    color: OZAGU.white,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 10,
  fontFamily: "SpaceGrotesk-Bold",  
  },
  profileUsername: {
    color: OZAGU.muted,
    fontSize: 12,
    marginTop: 3,  
  },
  profileBio: {
    color: "#DDD",
    textAlign: "center",
    marginTop: 10,
    fontSize: 12,
  },
  profileStats: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginTop: 18,
  },

  profileStat: {
    alignItems: "center",
  },

  profileStatNumber: {
    color: OZAGU.white,
    fontWeight: "900",
    fontSize: 17,
  },

  profileStatLabel: {
    color: OZAGU.muted,
    fontSize: 10,
    marginTop: 2,
  },

  menuCard: {
    marginTop: 14,
    backgroundColor: OZAGU.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: OZAGU.border,
    overflow: "hidden",
  },

  menuRow: {
    minHeight: 62,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: OZAGU.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: OZAGU.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconText: {
    color: OZAGU.white,
    fontSize: 16,
  },
  menuLabel: {
    color: OZAGU.white,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 12,
    flex: 1,
  },
  menuArrow: {
    color: OZAGU.muted,
    fontSize: 25,
  },
  aiScreen: {
    flex: 1,
    backgroundColor: OZAGU.background,
  },
  aiHeader: {
    height: 70,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: OZAGU.border,
  },
  aiBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: OZAGU.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBackText: {
    color: OZAGU.white,
    fontSize: 31,
    lineHeight: 31,
  },
  aiTitleBox: {
    flex: 1,
    marginLeft: 10,
  },
  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  aiTitle: {
    color: OZAGU.white,
    fontSize: 18,
    fontWeight: "900",
   fontFamily: "SpaceGrotesk-Bold", 
  },
  aiBeta: {
    color: OZAGU.purple,
    fontSize: 11,
    fontWeight: "900",
  },
  aiSubtitle: {
    color: OZAGU.muted,
    fontSize: 10,
    marginTop: 2,
  },
  aiEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  aiOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: OZAGU.violet,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  aiOrbText: {
    color: OZAGU.white,
    fontSize: 38,
  },
  aiWelcome: {
    color: OZAGU.white,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  aiHint: {
    color: OZAGU.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 7,
  },
  aiSuggestions: {
    width: "100%",
    marginTop: 25,
    gap: 9,
  },
  aiSuggestion: {
    padding: 13,
    backgroundColor: OZAGU.surface,
    borderWidth: 1,
    borderColor: OZAGU.border,
    borderRadius: 13,
  },
  aiSuggestionText: {
    color: OZAGU.white,
    fontSize: 12,
  },
  aiMessages: {
    padding: 15,
    paddingBottom: 20,
  },

  aiBubble: {
    maxWidth: "82%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },

  aiBubbleMine: {
    alignSelf: "flex-end",
    backgroundColor: OZAGU.violet,
    borderBottomRightRadius: 4,
  },

  aiBubbleOther: {
    alignSelf: "flex-start",
    backgroundColor: OZAGU.surface2,
    borderBottomLeftRadius: 4,
  },

  aiBubbleText: {
    color: OZAGU.white,
    fontSize: 13,
    lineHeight: 19,
  },
  aiImageMessage: {
    width: 240,
    height: 240,
    borderRadius: 14,
    marginTop: 8,
    resizeMode: "cover",
  },
  aiVideoWrap: {
    width: 260,
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000",
    marginTop: 8,
  },
  aiVideo: {
    width: "100%",
    height: "100%",
  },
  aiInputBar: {
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: OZAGU.border,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: OZAGU.surface,
  },
  aiAttach: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: OZAGU.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  aiAttachText: {
    color: OZAGU.white,
    fontSize: 25,
  },
  aiInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    backgroundColor: OZAGU.surface2,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: OZAGU.white,
    fontSize: 13,
  },
  aiSend: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: OZAGU.violet,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
  },
  aiSendText: {
    color: OZAGU.white,
    fontSize: 21,
    fontWeight: "900",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  modalSheet: {
    maxHeight: "88%",
    minHeight: 220,
    backgroundColor: OZAGU.surface,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderWidth: 1,
    borderColor: OZAGU.border,
    paddingBottom: 25,
  },
  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#555",
    alignSelf: "center",
    marginTop: 9,
    marginBottom: 4,
  },
  modalHeader: {
    paddingHorizontal: 17,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: OZAGU.border,
  },
  modalTitle: {
    color: OZAGU.white,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: "SpaceGrotesk-Bold",
  },
  modalClose: {
    color: OZAGU.white,
    fontSize: 30,
    fontWeight: "300",
  },
  modalBody: {
    padding: 18,
  },
  modalHint: {
    color: OZAGU.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  modalLargeNumber: {
    color: OZAGU.white,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 15,
  },
  modalSearch: {
    height: 48,
    backgroundColor: OZAGU.surface2,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  modalSearchInput: {
    flex: 1,
    color: OZAGU.white,
    fontSize: 14,
  },
  modalOption: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: OZAGU.border,
  },

  modalOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: OZAGU.surface2,
    alignItems: "center",
    justifyContent: "center",
  },

  modalOptionIconText: {
    color: OZAGU.white,
    fontSize: 17,
  },

  modalOptionText: {
    color: OZAGU.white,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 12,
  },
  commentInput: {
    minHeight: 52,
    backgroundColor: OZAGU.surface2,
    borderRadius: 17,
    padding: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  commentTextInput: {
    flex: 1,
    color: OZAGU.white,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  commentSend: {
    color: OZAGU.purple,
    fontSize: 22,
    fontWeight: "900",
    paddingHorizontal: 8,
  },
  profileModalName: {
    color: OZAGU.white,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 12,
  },
  profileModalUsername: {
    color: OZAGU.muted,
    fontSize: 12,
    marginTop: 3,
  },
  primaryButton: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 15,
    backgroundColor: OZAGU.violet,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: OZAGU.white,
    fontWeight: "900",
    fontSize: 13,
  },
  storyModalBody: {
    padding: 18,
    alignItems: "center",
  },
  storyModalImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  storyModalText: {
    color: OZAGU.white,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 15,
  },
  fakeConversation: {
    width: "100%",
    padding: 14,
    marginVertical: 18,
    backgroundColor: OZAGU.surface2,
    borderRadius: 15,
  },
  fakeMessage: {
    color: OZAGU.white,
    fontSize: 13,
  },
  modalUserRow: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: OZAGU.border,
  },
  modalUserName: {
    color: OZAGU.white,
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 12,
  },
  modalUserUsername: {
    color: OZAGU.muted,
    fontSize: 11,
    marginLeft: 12,
    marginTop: 2,
  },
  productModalImage: {
    width: "100%",
    height: 230,
    borderRadius: 16,
    resizeMode: "cover",
  },
  productModalTitle: {
    color: OZAGU.white,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 15,
  },
  productModalPrice: {
    color: OZAGU.gold,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 6,
  },
  productModalSeller: {
    color: OZAGU.muted,
    fontSize: 12,
    marginTop: 5,
  },
  formInput: {
    width: "100%",
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: OZAGU.surface2,
    color: OZAGU.white,
    paddingHorizontal: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: OZAGU.border,
  },
  formLarge: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  categoryModalTitle: {
    color: OZAGU.white,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 8,
  },
  settingRow: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: OZAGU.border,
  },
  settingLabel: {
    color: OZAGU.white,
    fontSize: 14,
  },
  settingToggle: {
    color: OZAGU.green,
    fontWeight: "900",
    fontSize: 11,
  },
  notificationModalText: {
    color: OZAGU.white,
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 15,
  },
  shareProfileBox: {
    marginTop: 15,
    padding: 14,
    borderRadius: 13,
    backgroundColor: OZAGU.surface2,
    borderWidth: 1,
    borderColor: OZAGU.border,
  },
  shareProfileText: {
    color: OZAGU.white,
    fontSize: 13,
  },
  
    syncalotContent: {
    padding: 14,
    paddingBottom: 105,
  },
  syncalotHero: {
    padding: 20,
    backgroundColor: OZAGU.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: OZAGU.border,
    alignItems: "center",
  },
  syncalotHeroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: OZAGU.violet,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  syncalotHeroTitle: {
    color: OZAGU.white,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    fontFamily: "SpaceGrotesk-Bold",
  },
  syncalotHeroSubtitle: {
    color: OZAGU.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 320,
  },
  syncalotPrimaryButton: {
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 15,
    backgroundColor: OZAGU.violet,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  syncalotPrimaryButtonText: {
    color: OZAGU.white,
    fontSize: 13,
    fontWeight: "900",
  },
  syncalotSectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  syncalotSectionTitle: {
    color: OZAGU.white,
    fontSize: 17,
    fontWeight: "900",
  },

  syncalotSectionSubtitle: {
    color: OZAGU.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
    maxWidth: 290,
  },

  syncalotQuickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
 syncalotQuickCard: {
    flex: 1,
    minHeight: 145,
    padding: 14,
    backgroundColor: OZAGU.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: OZAGU.border,
  },
  syncalotQuickIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  syncalotQuickTitle: {
    color: OZAGU.white,
    fontSize: 14,
    fontWeight: "900",
  },
  syncalotQuickText: {
    color: OZAGU.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },
  syncalotPersonCard: {
    padding: 13,
    backgroundColor: OZAGU.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: OZAGU.border,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 9,
  },
  syncalotPersonInfo: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 7,
  },
  syncalotPersonNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  syncalotPersonName: {
    color: OZAGU.white,
    fontSize: 14,
    fontWeight: "900",
  },
  syncalotPersonUsername: {
    color: OZAGU.muted,
    fontSize: 10,
    marginTop: 2,
  },
  syncalotPersonRole: {
    color: OZAGU.white,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 7,
  },
  syncalotPersonSkills: {
    color: OZAGU.muted,
    fontSize: 10,
    marginTop: 3,
  },
  syncalotPersonReason: {
    color: OZAGU.purple,
    fontSize: 9,
    marginTop: 7,
  },
  syncalotConnectButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: OZAGU.violet,
  },
  syncalotConnectText: {
    color: OZAGU.white,
    fontSize: 10,
    fontWeight: "900",
  },
  syncalotPortfolioCard: {
    padding: 15,
    backgroundColor: OZAGU.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: OZAGU.border,
    flexDirection: "row",
    alignItems: "center",
  },
  syncalotPortfolioIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: OZAGU.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  syncalotPortfolioInfo: {
    flex: 1,
    marginLeft: 12,
  },
  syncalotPortfolioTitle: {
    color: OZAGU.white,
    fontSize: 14,
    fontWeight: "900",
  },
  syncalotPortfolioText: {
    color: OZAGU.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  syncalotArrow: {
    color: OZAGU.muted,
    fontSize: 27,
    marginLeft: 8,
  },
  syncalotPostButton: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 15,
    backgroundColor: OZAGU.violet,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  syncalotPostButtonText: {
    color: OZAGU.white,
    fontSize: 10,
    fontWeight: "900",
  },
  syncalotPostCard: {
    marginBottom: 12,
    backgroundColor: OZAGU.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: OZAGU.border,
    overflow: "hidden",
  },
  syncalotPostHeader: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  syncalotPostUser: {
    flex: 1,
    marginLeft: 10,
  },
  syncalotPostName: {
    color: OZAGU.white,
    fontSize: 13,
    fontWeight: "900",
  },

  syncalotPostRole: {
    color: OZAGU.muted,
    fontSize: 10,
    marginTop: 3,
  },

  syncalotPostText: {
    color: OZAGU.white,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 13,
    paddingBottom: 12,
  },

  syncalotPostImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },

  syncalotPostActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: OZAGU.border,
    paddingVertical: 9,
  },

  syncalotPostAction: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },

  syncalotPostActionText: {
    color: OZAGU.muted,
    fontSize: 9,
    fontWeight: "700",
  },
}); 