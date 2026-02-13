import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';

interface SwipeableTaskProps {
  children: React.ReactNode;
  onComplete: () => void;
  onDelete: () => void;
  isCompleted?: boolean;
  taskName?: string;
}

export const SwipeableTask: React.FC<SwipeableTaskProps> = ({
  children,
  onComplete,
  onDelete,
  taskName = 'task'
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const x = useMotionValue(0);
  const controls = useAnimation();

  // Only enable swipe on mobile (screen width < 768px)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Transform values for visual feedback
  const backgroundComplete = useTransform(
    x,
    [0, 120],
    ['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.3)']
  );

  const backgroundDelete = useTransform(
    x,
    [-120, 0],
    ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0)']
  );

  const iconCompleteOpacity = useTransform(x, [0, 60, 120], [0, 0.5, 1]);
  const iconDeleteOpacity = useTransform(x, [-120, -60, 0], [1, 0.5, 0]);

  const triggerHaptic = () => {
    // Trigger haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleDragEnd = async (_event: any, info: PanInfo) => {
    const SWIPE_THRESHOLD = 120;
    const swipeDistance = info.offset.x;

    if (swipeDistance > SWIPE_THRESHOLD) {
      // Swipe right - Complete task
      triggerHaptic();
      
      // Animate to the right before completing
      await controls.start({ x: 300, opacity: 0, transition: { duration: 0.2 } });
      
      onComplete();
      
      // Reset position
      controls.start({ x: 0, opacity: 1, transition: { duration: 0.2 } });
    } else if (swipeDistance < -SWIPE_THRESHOLD) {
      // Swipe left - Show delete confirmation
      triggerHaptic();
      setShowDeleteConfirm(true);
      
      // Animate back to center
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300 } });
    } else {
      // Snap back to center if threshold not met
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300 } });
    }
  };

  const confirmDelete = async () => {
    // Animate out and delete
    await controls.start({ x: -300, opacity: 0, transition: { duration: 0.2 } });
    onDelete();
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Don't apply swipe gestures on desktop
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-xl">
        {/* Background indicators */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: backgroundComplete as any }}
        >
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ opacity: iconCompleteOpacity }}
          >
            <Check className="w-8 h-8 text-green-500" />
          </motion.div>
        </motion.div>
        
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: backgroundDelete as any }}
        >
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2"
            style={{ opacity: iconDeleteOpacity }}
          >
            <Trash2 className="w-8 h-8 text-red-500" />
          </motion.div>
        </motion.div>

        {/* Swipeable content */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -150, right: 150 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x }}
          className="relative z-10"
          whileDrag={{ scale: 1.02 }}
        >
          {children}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-sm w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Task?</h3>
                <p className="text-sm text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-300 mb-6">
              Are you sure you want to delete "<strong>{taskName}</strong>"?
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};