import numpy as np

class BehavioralAnomalyEngine:
    def __init__(self):
        # Established baseline for standard operations
        self.baseline_frequency = 12.0 

    def calculate_deviation_score(self, current_frequency: float, is_cross_zone: bool) -> float:
        """
        Calculates a live deviation score Ds based on behavioral shifts.
        Ensures 0.0 <= Ds <= 1.0.
        """
        # Frequency deviation factor calculation
        freq_delta = max(0.0, current_frequency - self.baseline_frequency)
        freq_score = min(0.5, freq_delta / 30.0)
        
        # Strict cross-zone unauthorized movement penalty
        zone_penalty = 0.4 if is_cross_zone else 0.0
        
        # Calculate overall deviation score
        D_s = float(np.clip(freq_score + zone_penalty, 0.0, 1.0))
        return D_s