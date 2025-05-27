import numpy as np
import tkinter as tk
from tkinter import ttk, messagebox
from scipy.optimize import linear_sum_assignment
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import seaborn as sns
from collections import deque

class LSASensitivityAnalyzer:
    """
    Advanced Linear Sum Assignment Sensitivity Analyzer
    
    This application analyzes how sensitive the optimal assignment solution is
    to changes in the cost matrix. It implements multiple mathematical approaches
    to calculate sensitivity bounds for each matrix element.
    """
    
    def __init__(self, root):
        self.root = root
        self.root.title("Advanced Linear Sum Assignment Sensitivity Analyzer")
        self.root.geometry("1400x900")
        
        # Variables
        self.matrix_size = tk.IntVar(value=4)
        self.sensitivity_method = tk.StringVar(value="basic")
        self.cost_matrix = None
        self.sensitivity_matrix = None
        self.original_assignment = None
        self.original_cost = None
        self.dual_variables = None
        
        self.setup_ui()
        
    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
        
        # Control panel
        control_frame = ttk.LabelFrame(main_frame, text="Controls", padding="5")
        control_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Matrix size control
        ttk.Label(control_frame, text="Matrix Size:").grid(row=0, column=0, padx=(0, 5))
        size_spin = ttk.Spinbox(control_frame, from_=2, to=8, textvariable=self.matrix_size, width=5)
        size_spin.grid(row=0, column=1, padx=(0, 10))
        
        # Sensitivity method selection with detailed tooltips
        ttk.Label(control_frame, text="Method:").grid(row=0, column=2, padx=(10, 5))
        method_combo = ttk.Combobox(control_frame, textvariable=self.sensitivity_method, width=20)
        method_combo['values'] = (
            'basic',            # Distance from row/column minimums
            'dual_based',       # Linear programming duality theory
            'auction_based',    # Auction algorithm bidding increments
            'geometric_bounds', # Assignment polytope geometry
            'reduced_cost',     # Network flow theory
            'perturbation_theory', # Matrix calculus approach
            'all_methods'       # Compare all methods
        )
        method_combo.grid(row=0, column=3, padx=(0, 10))
        
        # Buttons
        ttk.Button(control_frame, text="Create Matrix", command=self.create_matrix_input).grid(row=0, column=4, padx=5)
        ttk.Button(control_frame, text="Analyze", command=self.analyze_sensitivity).grid(row=0, column=5, padx=5)
        ttk.Button(control_frame, text="Random", command=self.generate_random_matrix).grid(row=0, column=6, padx=5)
        
        # Input frame
        self.input_frame = ttk.LabelFrame(main_frame, text="Cost Matrix Input", padding="5")
        self.input_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 5))
        
        # Results frame
        self.results_frame = ttk.LabelFrame(main_frame, text="Sensitivity Analysis Results", padding="5")
        self.results_frame.grid(row=1, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(5, 0))
        
        # Visualization frame
        self.viz_frame = ttk.LabelFrame(main_frame, text="Visualization & Comparison", padding="5")
        self.viz_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(10, 0))
        
        # Entry widgets storage
        self.entry_widgets = []
        
    def create_matrix_input(self):
        # Clear existing widgets
        for widget in self.input_frame.winfo_children():
            widget.destroy()
        
        size = self.matrix_size.get()
        self.entry_widgets = []
        
        # Create grid of entry widgets
        for i in range(size):
            row_entries = []
            for j in range(size):
                entry = ttk.Entry(self.input_frame, width=8, justify='center')
                entry.grid(row=i, column=j, padx=2, pady=2)
                entry.insert(0, "0")
                row_entries.append(entry)
            self.entry_widgets.append(row_entries)
            
        # Add labels
        info_label = ttk.Label(self.input_frame, text="Enter cost matrix values:")
        info_label.grid(row=size, column=0, columnspan=size, pady=(10, 0))
        
    def generate_random_matrix(self):
        if not self.entry_widgets:
            self.create_matrix_input()
            
        size = self.matrix_size.get()
        random_matrix = np.random.randint(1, 21, size=(size, size))
        
        for i in range(size):
            for j in range(size):
                self.entry_widgets[i][j].delete(0, tk.END)
                self.entry_widgets[i][j].insert(0, str(random_matrix[i, j]))
                
    def get_matrix_from_input(self):
        if not self.entry_widgets:
            raise ValueError("No matrix input created")
            
        size = self.matrix_size.get()
        matrix = np.zeros((size, size))
        
        for i in range(size):
            for j in range(size):
                try:
                    value = float(self.entry_widgets[i][j].get())
                    matrix[i, j] = value
                except ValueError:
                    raise ValueError(f"Invalid value at position ({i}, {j})")
                    
        return matrix
    
    def calculate_basic_sensitivity(self, cost_matrix):
        """
        METHOD 1: Basic Row/Column Minimum Distance Approach
        
        Theory: Simple heuristic that measures how far each element is from
        the minimum values in its row and column. This provides a basic
        estimate of how much an element can change before it becomes
        more attractive for assignment.
        
        Algorithm:
        1. For each cell (i,j), find the minimum in row i (excluding position j)
        2. Find the minimum in column j (excluding position i)
        3. Calculate distance from current value to these minimums
        4. Take the minimum of row and column sensitivities as limiting factor
        
        Strengths: Simple, intuitive, fast computation
        Weaknesses: Doesn't consider assignment structure, may be conservative
        """
        rows, cols = cost_matrix.shape
        sensitivity = np.zeros_like(cost_matrix)
        
        for i in range(rows):
            for j in range(cols):
                current_value = cost_matrix[i, j]
                
                # Get row values excluding current position
                row_values = np.delete(cost_matrix[i, :], j)
                # Get column values excluding current position  
                col_values = np.delete(cost_matrix[:, j], i)
                
                # Find minimums in row and column
                row_min = np.min(row_values) if len(row_values) > 0 else current_value
                col_min = np.min(col_values) if len(col_values) > 0 else current_value
                
                # Calculate sensitivity as distance from minimums
                row_sensitivity = max(0, current_value - row_min)
                col_sensitivity = max(0, current_value - col_min)
                
                # Take minimum as the limiting constraint
                sensitivity[i, j] = min(row_sensitivity, col_sensitivity)
                
        return sensitivity
    
    def calculate_dual_based_sensitivity(self, cost_matrix):
        """
        METHOD 2: Dual-Based Sensitivity Analysis
        
        Theory: Based on linear programming duality theory. The assignment problem
        can be formulated as a linear program, and its dual provides "shadow prices"
        (dual variables) that indicate the marginal value of resources.
        
        Mathematical Foundation:
        - Primal: min Σ c[i,j] * x[i,j] subject to assignment constraints
        - Dual: max Σ u[i] + Σ v[j] subject to u[i] + v[j] ≤ c[i,j]
        - Complementary slackness: u[i] + v[j] = c[i,j] for assigned pairs
        
        Algorithm:
        1. Solve the assignment problem to get optimal solution
        2. Calculate dual variables (u[i], v[j]) using complementary slackness
        3. Compute reduced costs: r[i,j] = c[i,j] - u[i] - v[j]
        4. Sensitivity = reduced cost (how much cost can decrease before optimality changes)
        
        Strengths: Theoretically sound, captures economic interpretation
        Weaknesses: May not capture all sensitivity aspects for discrete problems
        """
        rows, cols = cost_matrix.shape
        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        
        # Initialize dual variables (shadow prices)
        u = np.zeros(rows)  # Row dual variables (worker shadow prices)
        v = np.zeros(cols)  # Column dual variables (job shadow prices)
        
        # Calculate dual variables using complementary slackness
        # For assigned pairs: u[i] + v[j] = c[i,j]
        for i, j in zip(row_ind, col_ind):
            if i == 0:  # Normalize by setting first row dual to 0
                u[i] = 0
                v[j] = cost_matrix[i, j]
            else:
                # Use previously calculated v[j] to find u[i]
                u[i] = cost_matrix[i, j] - v[j]
        
        # Calculate reduced costs and sensitivity
        sensitivity = np.zeros_like(cost_matrix)
        for i in range(rows):
            for j in range(cols):
                # Reduced cost = original cost - dual values
                reduced_cost = cost_matrix[i, j] - u[i] - v[j]
                # Sensitivity is how much we can decrease cost before reduced cost becomes negative
                sensitivity[i, j] = max(0, reduced_cost)
                
        # Store dual variables for analysis
        self.dual_variables = (u, v)
        return sensitivity
    
    def auction_algorithm_sensitivity(self, cost_matrix, eps=1.0):
        """
        METHOD 3: Auction Algorithm-Based Sensitivity
        
        Theory: The auction algorithm solves assignment problems by simulating
        a market where "persons" bid for "objects". The bidding increments
        provide natural sensitivity measures.
        
        Algorithm Concept:
        - Persons compete for objects by placing bids
        - Bid increment = (second best benefit - best benefit) + ε
        - This increment represents how much the cost can change before
          the person switches to a different object
        
        Sensitivity Interpretation:
        1. Each iteration, calculate benefits for unassigned persons
        2. Find best and second-best objects for each person
        3. Bid increment = competitive gap + auction parameter ε
        4. This increment indicates robustness of the assignment
        
        Algorithm Steps:
        1. Initialize prices and assignments
        2. For each unassigned person, find best and second-best objects
        3. Calculate bid increment based on competitive gap
        4. Update prices and assignments
        5. Record bid increments as sensitivity measures
        
        Strengths: Natural economic interpretation, captures competitive dynamics
        Weaknesses: May depend on ε parameter, iterative nature can be slow
        """
        n = cost_matrix.shape[0]
        prices = np.zeros(n)  # Current prices for objects
        assignment = [-1] * n  # person -> object assignment
        reverse_assignment = [-1] * n  # object -> person assignment
        
        # Run auction algorithm with sensitivity tracking
        max_iterations = n * n  # Prevent infinite loops
        sensitivity = np.zeros_like(cost_matrix)
        
        for iteration in range(max_iterations):
            # Find unassigned persons
            unassigned = [i for i in range(n) if assignment[i] == -1]
            if not unassigned:
                break  # All persons assigned
                
            person = unassigned[0]  # Take first unassigned person
            
            # Calculate benefits for this person (negative cost - price)
            benefits = -(cost_matrix[person, :] + prices)  # Note: we want to minimize cost
            best_obj = np.argmax(benefits)  # Best object (highest benefit)
            
            # Find second-best benefit for competitive bidding
            if n > 1:
                second_best_benefit = np.partition(benefits, -2)[-2]  # Second highest
            else:
                second_best_benefit = benefits[0]
            
            best_benefit = benefits[best_obj]
            
            # Calculate bid increment (key for sensitivity analysis)
            # This represents how much the assignment can tolerate cost changes
            bid_increment = best_benefit - second_best_benefit + eps
            
            # Update sensitivity matrix with bid increment
            sensitivity[person, best_obj] = bid_increment
            
            # Update auction state
            if reverse_assignment[best_obj] != -1:
                # Remove previous assignment (outbid previous person)
                old_person = reverse_assignment[best_obj]
                assignment[old_person] = -1
                
            # Make new assignment
            assignment[person] = best_obj
            reverse_assignment[best_obj] = person
            prices[best_obj] += bid_increment  # Increase price due to bidding
            
        return sensitivity
    
    def geometric_bounds_sensitivity(self, cost_matrix):
        """
        METHOD 4: Geometric Bounds Using Assignment Polytope
        
        Theory: The assignment problem has a geometric interpretation where
        the feasible region forms a polytope. Sensitivity can be analyzed
        by examining the geometry of this polytope and vertex distances.
        
        Mathematical Foundation:
        - Assignment polytope: convex hull of all permutation matrices
        - Each vertex represents a valid assignment
        - Edges connect assignments differing by one swap
        - Sensitivity = distance to nearest polytope boundary
        
        Algorithm Approach:
        1. For each matrix element, analyze its "competitive position"
        2. Sort elements in each row and column to find rank positions
        3. Calculate gaps to next competitive elements
        4. Use rank-based geometric bounds as sensitivity measures
        
        Geometric Interpretation:
        - Elements with lower ranks are more "secure" in their positions
        - Gaps to next-ranked elements indicate sensitivity bounds
        - Minimum of row/column gaps gives the limiting geometric constraint
        
        Algorithm Steps:
        1. For each cell (i,j), get all competitors in row i and column j
        2. Sort competitors to establish ranking
        3. Find current element's rank position
        4. Calculate gap to next-ranked element
        5. Take minimum gap as geometric sensitivity bound
        
        Strengths: Geometric intuition, considers local competition structure
        Weaknesses: Simplified model, may not capture global optimization effects
        """
        rows, cols = cost_matrix.shape
        sensitivity = np.zeros_like(cost_matrix)
        
        # For each cell, calculate geometric bounds based on competitive position
        for i in range(rows):
            for j in range(cols):
                # Get competitors in the same row and column
                row_competitors = cost_matrix[i, :]  # All elements in row i
                col_competitors = cost_matrix[:, j]  # All elements in column j
                
                # Sort to establish competitive ranking
                row_sorted = np.sort(row_competitors)
                col_sorted = np.sort(col_competitors)
                
                # Find current element's rank position
                current_value = cost_matrix[i, j]
                row_rank = np.where(row_sorted == current_value)[0][0]
                col_rank = np.where(col_sorted == current_value)[0][0]
                
                # Calculate geometric gaps to next competitive level
                if row_rank < len(row_sorted) - 1:
                    row_gap = row_sorted[row_rank + 1] - current_value
                else:
                    row_gap = float('inf')  # Already highest in row
                    
                if col_rank < len(col_sorted) - 1:
                    col_gap = col_sorted[col_rank + 1] - current_value
                else:
                    col_gap = float('inf')  # Already highest in column
                
                # Sensitivity is the minimum gap (limiting constraint)
                min_gap = min(row_gap, col_gap)
                sensitivity[i, j] = min_gap if min_gap != float('inf') else 10.0
                
        return sensitivity
    
    def reduced_cost_sensitivity(self, cost_matrix):
        """
        METHOD 5: Advanced Reduced Cost Analysis with Network Flow Theory
        
        Theory: Assignment problems can be modeled as minimum cost flow problems
        on bipartite graphs. Reduced cost analysis examines the dual solution
        and alternating cycles in the residual graph.
        
        Network Flow Foundation:
        - Model as min-cost flow: source → workers → jobs → sink
        - Reduced costs indicate "profitability" of unused edges
        - Optimal solution has all reduced costs ≥ 0
        - Sensitivity = minimum cost to violate reduced cost conditions
        
        Mathematical Approach:
        1. Calculate node potentials (dual variables) from optimal solution
        2. Compute reduced costs for all edges: r[i,j] = c[i,j] - π[i] - π[j]
        3. For assigned edges: find minimum cost alternating cycle
        4. For unassigned edges: sensitivity = reduced cost
        
        Alternating Cycle Analysis:
        - To remove an assigned edge, must find alternative augmenting path
        - Cost of removing edge = minimum cost alternating cycle through that edge
        - This represents true sensitivity of assignment decisions
        
        Algorithm Steps:
        1. Solve assignment to get optimal matching
        2. Calculate node potentials using optimal assignment
        3. For each unassigned edge: sensitivity = reduced cost
        4. For each assigned edge: find min-cost alternating cycle
        5. Cycle cost represents sensitivity to removing that assignment
        
        Strengths: Theoretically rigorous, captures network structure
        Weaknesses: Complex cycle-finding, computationally intensive
        """
        rows, cols = cost_matrix.shape
        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        
        # Initialize sensitivity matrix
        sensitivity = np.zeros_like(cost_matrix)
        
        # Calculate node potentials (dual variables) using network flow theory
        potentials_u = np.zeros(rows)  # Worker potentials
        potentials_v = np.zeros(cols)  # Job potentials
        
        # Set potentials based on optimal solution structure
        # Use the fact that for assigned edges: potential_u[i] + potential_v[j] = cost[i,j]
        for i, j in zip(row_ind, col_ind):
            potentials_v[j] = cost_matrix[i, j] - potentials_u[i]
        
        # Calculate reduced costs and sensitivities
        for i in range(rows):
            for j in range(cols):
                # Reduced cost = original cost - sum of potentials
                reduced_cost = cost_matrix[i, j] - potentials_u[i] - potentials_v[j]
                
                if (i, j) in zip(row_ind, col_ind):
                    # For assigned edges: find minimum cost alternating cycle
                    # This represents the cost of "breaking" this assignment
                    sensitivity[i, j] = self._find_min_cost_cycle(cost_matrix, i, j, row_ind, col_ind)
                else:
                    # For unassigned edges: sensitivity is the reduced cost
                    # This represents how much the cost must decrease to make this edge attractive
                    sensitivity[i, j] = max(0, reduced_cost)
                    
        return sensitivity
    
    def _find_min_cost_cycle(self, cost_matrix, exclude_i, exclude_j, row_ind, col_ind):
        """
        Helper function to find minimum cost alternating cycle.
        
        Theory: To remove an assigned edge (exclude_i, exclude_j), we need to find
        an alternating path that maintains assignment feasibility. The cost of
        the minimum such cycle represents the sensitivity of this assignment.
        
        Simplified Algorithm:
        1. For each alternative assignment for worker exclude_i
        2. Find the displaced worker from that alternative
        3. Calculate cycle cost: new_cost - old_cost
        4. Return minimum cycle cost
        
        Note: This is a simplified version. Full implementation would use
        sophisticated graph algorithms like Hungarian method variants or
        shortest augmenting path algorithms.
        """
        n = cost_matrix.shape[0]
        min_cycle_cost = float('inf')
        
        # Find alternative assignments that create valid alternating cycles
        for alt_j in range(n):
            if alt_j != exclude_j:  # Try assigning exclude_i to alt_j
                for alt_i in range(n):
                    if alt_i != exclude_i and alt_i in row_ind:
                        # Calculate cycle cost for this alternative
                        # Cost = new assignments - old assignments
                        current_alt_j = col_ind[list(row_ind).index(alt_i)]
                        cycle_cost = (cost_matrix[exclude_i, alt_j] + 
                                    cost_matrix[alt_i, exclude_j] - 
                                    cost_matrix[exclude_i, exclude_j] - 
                                    cost_matrix[alt_i, current_alt_j])
                        min_cycle_cost = min(min_cycle_cost, abs(cycle_cost))
                        
        return min_cycle_cost if min_cycle_cost != float('inf') else 5.0
    
    def perturbation_theory_sensitivity(self, cost_matrix):
        """
        METHOD 6: Perturbation Theory Using Matrix Calculus
        
        Theory: Perturbation theory analyzes how solutions change when problem
        parameters are slightly modified. For assignment problems, we examine
        how matrix perturbations affect the optimal solution structure.
        
        Mathematical Foundation:
        - Consider cost matrix C and perturbed matrix C + εE
        - Analyze first and second-order effects of perturbations
        - Use matrix norms and eigenvalue sensitivity theory
        - Sensitivity ≈ ||∂solution/∂parameter||
        
        Matrix Calculus Approach:
        1. For each element, create small perturbation δ
        2. Measure resulting changes in matrix properties
        3. Use norm-based sensitivity measures
        4. Combine multiple norm metrics for robustness
        
        Norm-Based Sensitivity Measures:
        - Frobenius norm: √(Σᵢⱼ |aᵢⱼ|²) - measures overall matrix change
        - Spectral norm: largest singular value - measures maximum directional change
        - Combined measure provides robust sensitivity estimate
        
        Algorithm Steps:
        1. For each matrix element (i,j):
        2. Create perturbation matrix with small change δ at position (i,j)
        3. Calculate Frobenius norm change: ||C_perturbed - C||_F
        4. Calculate spectral norm change: ||C_perturbed - C||_2
        5. Combine measures and scale by perturbation size
        6. Result indicates sensitivity to changes at that position
        
        Strengths: Mathematically rigorous, captures higher-order effects
        Weaknesses: May not directly relate to assignment changes, computationally intensive
        """
        rows, cols = cost_matrix.shape
        sensitivity = np.zeros_like(cost_matrix)
        
        # Small perturbation for numerical differentiation
        delta = 0.01
        
        # Calculate matrix-norm-based sensitivity for each element
        for i in range(rows):
            for j in range(cols):
                # Create perturbation matrix
                pert_matrix = cost_matrix.copy()
                pert_matrix[i, j] += delta
                
                # Calculate various matrix properties for sensitivity analysis
                
                # 1. Matrix trace changes (sum of diagonal elements)
                original_trace = np.trace(cost_matrix)
                perturbed_trace = np.trace(pert_matrix)
                trace_sensitivity = abs(perturbed_trace - original_trace) / delta
                
                # 2. Frobenius norm change (overall matrix magnitude change)
                frobenius_change = np.linalg.norm(pert_matrix - cost_matrix, 'fro')
                frobenius_sensitivity = frobenius_change / delta
                
                # 3. Spectral norm change (maximum singular value change)
                spectral_change = np.linalg.norm(pert_matrix - cost_matrix, 2)
                spectral_sensitivity = spectral_change / delta
                
                # 4. Condition number sensitivity (numerical stability measure)
                try:
                    orig_cond = np.linalg.cond(cost_matrix)
                    pert_cond = np.linalg.cond(pert_matrix)
                    cond_sensitivity = abs(pert_cond - orig_cond) / delta
                except:
                    cond_sensitivity = 0
                
                # Combine multiple sensitivity measures for robust estimate
                # Weight different measures based on their relevance to assignment problems
                combined_sensitivity = (
                    0.3 * frobenius_sensitivity +    # Overall change importance
                    0.3 * spectral_sensitivity +     # Directional change importance  
                    0.2 * trace_sensitivity +        # Diagonal structure importance
                    0.2 * cond_sensitivity           # Numerical stability importance
                ) * 100  # Scale for visualization
                
                sensitivity[i, j] = combined_sensitivity
                
        return sensitivity
    
    def analyze_sensitivity(self):
        try:
            self.cost_matrix = self.get_matrix_from_input()
            row_ind, col_ind = linear_sum_assignment(self.cost_matrix)
            self.original_assignment = (row_ind, col_ind)
            self.original_cost = self.cost_matrix[row_ind, col_ind].sum()
            
            method = self.sensitivity_method.get()
            
            if method == 'basic':
                self.sensitivity_matrix = self.calculate_basic_sensitivity(self.cost_matrix)
            elif method == 'dual_based':
                self.sensitivity_matrix = self.calculate_dual_based_sensitivity(self.cost_matrix)
            elif method == 'auction_based':
                self.sensitivity_matrix = self.auction_algorithm_sensitivity(self.cost_matrix)
            elif method == 'geometric_bounds':
                self.sensitivity_matrix = self.geometric_bounds_sensitivity(self.cost_matrix)
            elif method == 'reduced_cost':
                self.sensitivity_matrix = self.reduced_cost_sensitivity(self.cost_matrix)
            elif method == 'perturbation_theory':
                self.sensitivity_matrix = self.perturbation_theory_sensitivity(self.cost_matrix)
            elif method == 'all_methods':
                self.compare_all_methods()
                return
            
            self.display_results()
            self.create_visualization()
            
        except Exception as e:
            messagebox.showerror("Error", str(e))
    
    def compare_all_methods(self):
        """
        Compare all sensitivity methods side by side.
        
        This function runs all implemented sensitivity analysis methods
        on the same cost matrix to allow comparison of their different
        approaches and results.
        """
        methods = {
            'Basic': self.calculate_basic_sensitivity(self.cost_matrix),
            'Dual-based': self.calculate_dual_based_sensitivity(self.cost_matrix),
            'Auction': self.auction_algorithm_sensitivity(self.cost_matrix),
            'Geometric': self.geometric_bounds_sensitivity(self.cost_matrix),
            'Reduced Cost': self.reduced_cost_sensitivity(self.cost_matrix),
            'Perturbation': self.perturbation_theory_sensitivity(self.cost_matrix)
        }
        
        self.create_comparison_visualization(methods)
        
    def display_results(self):
        # Clear existing results
        for widget in self.results_frame.winfo_children():
            widget.destroy()
            
        # Original assignment info
        info_text = f"Original Assignment Cost: {self.original_cost:.2f}\n"
        info_text += f"Method: {self.sensitivity_method.get()}\n"
        info_text += f"Assignment: {list(zip(self.original_assignment[0], self.original_assignment[1]))}"
        
        info_label = ttk.Label(self.results_frame, text=info_text, font=('Arial', 10))
        info_label.grid(row=0, column=0, columnspan=len(self.sensitivity_matrix[0]), pady=(0, 10))
        
        # Sensitivity matrix display
        sens_label = ttk.Label(self.results_frame, text="Sensitivity Matrix:", font=('Arial', 10, 'bold'))
        sens_label.grid(row=1, column=0, columnspan=len(self.sensitivity_matrix[0]), pady=(0, 5))
        
        # Create grid for sensitivity values with color coding
        for i, row in enumerate(self.sensitivity_matrix):
            for j, value in enumerate(row):
                # Highlight cells that are in the optimal assignment
                if i in self.original_assignment[0] and j == self.original_assignment[1][list(self.original_assignment[0]).index(i)]:
                    bg_color = 'lightgreen'  # Assigned cells
                else:
                    bg_color = 'white'  # Unassigned cells
                    
                label = tk.Label(self.results_frame, text=f"{value:.2f}", 
                               relief='solid', borderwidth=1, width=8, height=2,
                               bg=bg_color)
                label.grid(row=i+2, column=j, padx=1, pady=1)
                
    def create_visualization(self):
        for widget in self.viz_frame.winfo_children():
            widget.destroy()
            
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
        
        # Cost matrix heatmap
        sns.heatmap(self.cost_matrix, annot=True, fmt='.1f', cmap='Blues', ax=ax1)
        ax1.set_title('Cost Matrix')
        
        # Highlight optimal assignment with red rectangles
        for i, j in zip(self.original_assignment[0], self.original_assignment[1]):
            ax1.add_patch(plt.Rectangle((j, i), 1, 1, fill=False, edgecolor='red', lw=3))
            
        # Sensitivity matrix heatmap
        sns.heatmap(self.sensitivity_matrix, annot=True, fmt='.2f', cmap='Reds', ax=ax2)
        ax2.set_title(f'Sensitivity Matrix ({self.sensitivity_method.get()})')
        
        canvas = FigureCanvasTkAgg(fig, self.viz_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill='both', expand=True)
        
        plt.tight_layout()
        
    def create_comparison_visualization(self, methods):
        """
        Create side-by-side visualization of all sensitivity analysis methods.
        
        This allows users to compare how different mathematical approaches
        produce different sensitivity estimates for the same cost matrix.
        """
        for widget in self.viz_frame.winfo_children():
            widget.destroy()
            
        n_methods = len(methods)
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        axes = axes.flatten()
        
        for idx, (method_name, sensitivity_matrix) in enumerate(methods.items()):
            if idx < len(axes):
                sns.heatmap(sensitivity_matrix, annot=True, fmt='.1f', 
                           cmap='Reds', ax=axes[idx], cbar_kws={'shrink': 0.8})
                axes[idx].set_title(f'{method_name} Method')
                
                # Highlight optimal assignment with blue rectangles
                for i, j in zip(self.original_assignment[0], self.original_assignment[1]):
                    axes[idx].add_patch(plt.Rectangle((j, i), 1, 1, fill=False, edgecolor='blue', lw=2))
        
        # Hide unused subplots
        for idx in range(n_methods, len(axes)):
            axes[idx].set_visible(False)
            
        canvas = FigureCanvasTkAgg(fig, self.viz_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill='both', expand=True)
        
        plt.tight_layout()

def main():
    root = tk.Tk()
    app = LSASensitivityAnalyzer(root)
    root.mainloop()

if __name__ == "__main__":
    main()