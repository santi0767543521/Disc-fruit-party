import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  DisplayMode,
  FRUIT_CONFIGS,
  FruitType,
} from '../types/sensory';
import { FruitSvgArt } from './FruitSvgArt';

const LONG_PRESS_DURATION_MS = 2000; // 2-second long press required to unlock

interface ModeToggleControlProps {
  displayMode: DisplayMode;
  onChangeDisplayMode: (mode: DisplayMode) => void;
  spotlightFruit: FruitType;
  onSelectSpotlightFruit: (fruit: FruitType) => void;
  partyFruitCount: number;
  onChangePartyFruitCount: (count: number) => void;
  isMusicMuted: boolean;
  onToggleMusicMute: () => void;
  onUnlockHaptic: () => void;
}

export const ModeToggleControl: React.FC<ModeToggleControlProps> = React.memo(
  ({
    displayMode,
    onChangeDisplayMode,
    spotlightFruit,
    onSelectSpotlightFruit,
    partyFruitCount,
    onChangePartyFruitCount,
    isMusicMuted,
    onToggleMusicMute,
    onUnlockHaptic,
  }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const holdProgress = useSharedValue(0);

    const clearHold = useCallback(() => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      setIsHolding(false);
      cancelAnimation(holdProgress);
      holdProgress.value = withTiming(0, { duration: 150 });
    }, [holdProgress]);

    useEffect(() => {
      return () => {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
        }
      };
    }, []);

    const handlePressIn = useCallback(() => {
      setIsHolding(true);
      holdProgress.value = 0;
      holdProgress.value = withTiming(1, {
        duration: LONG_PRESS_DURATION_MS,
        easing: Easing.linear,
      });

      holdTimerRef.current = setTimeout(() => {
        setIsHolding(false);
        holdProgress.value = 0;
        onUnlockHaptic();
        setIsMenuOpen(true);
      }, LONG_PRESS_DURATION_MS);
    }, [holdProgress, onUnlockHaptic]);

    const progressFillStyle = useAnimatedStyle(() => {
      return {
        width: `${Math.round(holdProgress.value * 100)}%`,
      };
    });

    return (
      <>
        {/* Top Bar Overlay: Easy-to-reach Mute Button + Toddler-Lock 2s Mode Toggle */}
        <View pointerEvents="box-none" style={styles.topControlsRow}>
          {/* Easy-to-reach Cumbia Backing Track Mute Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onToggleMusicMute}
            style={[
              styles.muteButton,
              isMusicMuted ? styles.muteButtonMuted : styles.muteButtonActive,
            ]}
            accessibilityLabel={
              isMusicMuted ? 'Unmute Cumbia Music' : 'Mute Cumbia Music'
            }
          >
            <Text style={styles.muteIcon}>{isMusicMuted ? '🔇' : '🪇'}</Text>
            <Text style={styles.muteLabel}>
              {isMusicMuted ? 'Cumbia Off' : '120 BPM'}
            </Text>
          </TouchableOpacity>

          {/* Hidden Mode Toggle in Top-Right Corner (Requires 2-Second Long Press) */}
          <View style={styles.rightCornerWrapper}>
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={clearHold}
              style={[
                styles.hiddenToggleButton,
                isHolding && styles.hiddenToggleButtonHolding,
              ]}
              accessibilityLabel="Hold 2 seconds for parent mode controls"
            >
              <Text style={styles.hiddenToggleText}>
                {displayMode === 'party' ? '🎉' : '🔦'}
              </Text>
              <View style={styles.holdTrack}>
                <Animated.View
                  style={[styles.holdProgressFill, progressFillStyle]}
                />
              </View>
            </Pressable>
            {isHolding && (
              <Text style={styles.holdHintText}>Hold 2s to open…</Text>
            )}
          </View>
        </View>

        {/* Parent Mode Selection Modal (Opened after 2s Long Press) */}
        <Modal
          visible={isMenuOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsMenuOpen(false)}
          >
            <Pressable
              style={styles.modalCard}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>✨ Disco Fruit Party</Text>
                <TouchableOpacity
                  onPress={() => setIsMenuOpen(false)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionLabel}>DISPLAY MODE</Text>
              <View style={styles.modeCardsRow}>
                <TouchableOpacity
                  style={[
                    styles.modeOptionCard,
                    displayMode === 'party' && styles.modeOptionCardActive,
                  ]}
                  onPress={() => {
                    onChangeDisplayMode('party');
                    onUnlockHaptic();
                  }}
                >
                  <Text style={styles.modeEmoji}>🎉</Text>
                  <Text style={styles.modeTitle}>Fruit Party Mode</Text>
                  <Text style={styles.modeSub}>
                    {partyFruitCount} fruits dancing together
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeOptionCard,
                    displayMode === 'spotlight' && styles.modeOptionCardActive,
                  ]}
                  onPress={() => {
                    onChangeDisplayMode('spotlight');
                    onUnlockHaptic();
                  }}
                >
                  <Text style={styles.modeEmoji}>🔦</Text>
                  <Text style={styles.modeTitle}>Solo Spotlight</Text>
                  <Text style={styles.modeSub}>
                    1 large center-stage fruit + aura
                  </Text>
                </TouchableOpacity>
              </View>

              {displayMode === 'party' ? (
                <View style={styles.subSection}>
                  <Text style={styles.sectionLabel}>
                    PARTY DANCERS ON SCREEN (4–6 FRUITS)
                  </Text>
                  <View style={styles.countPillsRow}>
                    {[4, 5, 6].map((count) => (
                      <TouchableOpacity
                        key={count}
                        style={[
                          styles.countPill,
                          partyFruitCount === count && styles.countPillActive,
                        ]}
                        onPress={() => {
                          onChangePartyFruitCount(count);
                          onUnlockHaptic();
                        }}
                      >
                        <Text
                          style={[
                            styles.countPillText,
                            partyFruitCount === count &&
                              styles.countPillTextActive,
                          ]}
                        >
                          {count} Fruits
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.subSection}>
                  <Text style={styles.sectionLabel}>
                    CHOOSE SOLO SPOTLIGHT STAR
                  </Text>
                  <View style={styles.fruitPickerGrid}>
                    {FRUIT_CONFIGS.map((fruit) => {
                      const isSelected = spotlightFruit === fruit.id;
                      return (
                        <TouchableOpacity
                          key={fruit.id}
                          style={[
                            styles.fruitPickerItem,
                            isSelected && {
                              borderColor: fruit.glowColor,
                              backgroundColor: 'rgba(255,255,255,0.12)',
                            },
                          ]}
                          onPress={() => {
                            onSelectSpotlightFruit(fruit.id);
                            onUnlockHaptic();
                          }}
                        >
                          <FruitSvgArt
                            type={fruit.id}
                            size={44}
                            isWinking={isSelected}
                          />
                          <Text
                            style={styles.fruitPickerName}
                            numberOfLines={1}
                          >
                            {fruit.name.split(' ')[1] || fruit.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Music Backing Track Control inside Modal */}
              <View style={styles.audioRow}>
                <Text style={styles.audioRowLabel}>
                  🪇 120 BPM Cumbia Backing Track
                </Text>
                <TouchableOpacity
                  style={[
                    styles.audioToggleBtn,
                    !isMusicMuted && styles.audioToggleBtnOn,
                  ]}
                  onPress={onToggleMusicMute}
                >
                  <Text style={styles.audioToggleBtnText}>
                    {isMusicMuted ? 'Muted' : 'Playing'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  }
);

const styles = StyleSheet.create({
  topControlsRow: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 50,
  },
  muteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  muteButtonActive: {
    backgroundColor: 'rgba(255, 214, 10, 0.14)',
    borderColor: 'rgba(255, 214, 10, 0.4)',
  },
  muteButtonMuted: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  muteIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  muteLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    fontWeight: '600',
  },
  rightCornerWrapper: {
    alignItems: 'flex-end',
  },
  hiddenToggleButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hiddenToggleButtonHolding: {
    borderColor: '#FFE600',
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
  },
  hiddenToggleText: {
    fontSize: 17,
    opacity: 0.55,
  },
  holdTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  holdProgressFill: {
    height: '100%',
    backgroundColor: '#FFE600',
  },
  holdHintText: {
    marginTop: 4,
    color: '#FFE600',
    fontSize: 11,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111116',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  modeCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  modeOptionCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  modeOptionCardActive: {
    borderColor: '#FFE600',
    backgroundColor: 'rgba(255, 230, 0, 0.12)',
  },
  modeEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  modeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
    textAlign: 'center',
  },
  modeSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textAlign: 'center',
  },
  subSection: {
    marginBottom: 18,
  },
  countPillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  countPillActive: {
    backgroundColor: '#38E54D',
    borderColor: '#38E54D',
  },
  countPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  countPillTextActive: {
    color: '#000000',
  },
  fruitPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  fruitPickerItem: {
    width: 78,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  fruitPickerName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  audioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  audioRowLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  audioToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  audioToggleBtnOn: {
    backgroundColor: '#FFE600',
  },
  audioToggleBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
  },
});
