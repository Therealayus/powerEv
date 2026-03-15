import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const BRAND = {
  background: '#0F172A',
  card: '#1E293B',
  primary: '#22C55E',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
};

export default function SplashScreen({ fading }) {
  const { width } = useWindowDimensions();
  const shineX = useSharedValue(-120);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withDelay(100, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    shineX.value = withDelay(
      600,
      withTiming(width + 120, {
        duration: 1400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
  }, [width]);

  useEffect(() => {
    if (fading) screenOpacity.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.ease) });
  }, [fading]);

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shineX.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const containerStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <Image
            source={require('../assets/logo-wordmark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          {/* Shine overlay: narrow gradient band sweeping across */}
          <Animated.View style={[styles.shineWrap, shineStyle]} pointerEvents="none">
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.35)', 'rgba(34,197,94,0.25)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shine}
            />
          </Animated.View>
        </Animated.View>
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Find stations. Charge. Go.
        </Animated.Text>
      </View>
      <View style={styles.footer}>
        <View style={[styles.dot, { backgroundColor: BRAND.primary }]} />
        <Text style={styles.footerText}>EV Charging</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 220,
    height: 48,
  },
  shineWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: '100%',
    justifyContent: 'center',
  },
  shine: {
    width: 100,
    height: 60,
    borderRadius: 4,
  },
  tagline: {
    marginTop: 16,
    fontSize: 15,
    color: BRAND.textSecondary,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerText: {
    fontSize: 13,
    color: BRAND.textSecondary,
    fontWeight: '500',
  },
});
