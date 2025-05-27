# Basic Usage Examples

This page provides practical examples to help you understand how to use the Matrix Assignment Sensitivity Analyzer effectively.

## Example 1: Job Assignment Problem

### Scenario
A company has 3 employees and 3 projects. Each employee has different skill levels for each project, resulting in different completion times (in hours).

### Setup Matrix
```
Employees → Projects   Web App   Mobile App   Database
Alice                     8          12          15
Bob                      10           6           9
Carol                     7          14          11
```

### Steps
1. Set matrix size to 3×3 using the sliders
2. Enter the values by clicking cells or double-clicking for direct input
3. Choose "Minimize" mode (we want minimum total hours)
4. Observe the optimal assignment

### Expected Results
- **Optimal Assignment**: Alice→Web App (8h), Bob→Mobile App (6h), Carol→Database (11h)
- **Total Time**: 25 hours
- **Sensitivity Analysis**: Shows Bob's Mobile App assignment is most stable

## Example 2: Profit Maximization

### Scenario
A logistics company can assign 3 drivers to 3 routes. Each driver generates different profit on each route based on their experience and route familiarity.

### Setup Matrix
```
Drivers → Routes   Route A   Route B   Route C
Driver 1              45        30        25
Driver 2              35        50        40
Driver 3              40        35        55
```

### Steps
1. Set matrix to 3×3
2. Enter profit values
3. Choose "Maximize" mode
4. Analyze the sensitivity results

### Expected Results
- **Optimal Assignment**: Driver 1→Route A ($45), Driver 2→Route B ($50), Driver 3→Route C ($55)
- **Total Profit**: $150
- **Key Insight**: Driver 3's Route C assignment has low sensitivity - profit could decrease significantly before changing assignment

## Example 3: Resource Allocation

### Scenario
A manufacturing plant needs to assign 4 machines to 3 products. Not all machines can produce all products efficiently.

### Setup Matrix
```
Machines → Products   Product X   Product Y   Product Z
Machine A                 12          18          ∞
Machine B                 15          14          16
Machine C                 20          12          14
Machine D                 10          22          18
```

*Note: Use a very high number (99) to represent impossible assignments*

### Steps
1. Set matrix to 4×3 (more machines than products)
2. Enter cost values, use 99 for impossible assignments
3. Choose "Minimize" mode
4. Some machines will remain unassigned

### Expected Results
- **Optimal Assignment**: Machine A→Product X, Machine C→Product Y, Machine B→Product Z
- **Unassigned**: Machine D (excess capacity)
- **Sensitivity**: Shows which machine reassignments are most flexible

## Understanding Sensitivity Output

### High Sensitivity (Red) - Values < 4
```
Current Cost: 10
Sensitivity: 2
Interpretation: Cost can only increase to 12 before assignment changes
```

### Medium Sensitivity (Yellow/Orange) - Values 4-10
```
Current Cost: 15
Sensitivity: 7
Interpretation: Cost can increase to 22 while maintaining optimal assignment
```

### Low Sensitivity (Green) - Values > 10 or ∞
```
Current Cost: 8
Sensitivity: ∞
Interpretation: This assignment is so optimal that cost changes won't affect it
```

## Interactive Features

### Mouse Controls
- **Single Left Click**: Increment value (+1)
- **Single Right Click**: Decrement value (-1)
- **Double Click**: Open custom input dialog
- **Hover**: View tooltips with position information

### Real-time Updates
Every change triggers:
1. Hungarian algorithm recalculation
2. New optimal assignment
3. Updated sensitivity analysis
4. Color-coded visualization refresh

## Tips for Effective Analysis

### 1. Start with Simple Values
Begin with round numbers (5, 10, 15) to understand patterns before using precise data.

### 2. Compare Min vs Max
Try the same matrix with both optimization modes to see how objectives change results:
```javascript
// Same data, different objectives
const matrix = [[10, 15], [12, 8]];
// Minimize: Different optimal assignment than Maximize
```

### 3. Test Edge Cases
- All equal values: `[[5, 5], [5, 5]]`
- One dominant option: `[[1, 100], [100, 1]]`
- Impossible assignments: Use very high costs

### 4. Monitor Color Changes
Watch how sensitivity colors change as you modify values - this shows the stability of your solution.

## Common Patterns

### Dominant Strategy
When one assignment is clearly superior:
```
[[1, 10, 10],
 [10, 1, 10], 
 [10, 10, 1]]
```
Result: Perfect diagonal assignment with high sensitivity on diagonal, low on off-diagonal.

### Competitive Assignments
When multiple options are similar:
```
[[5, 6, 7],
 [6, 5, 8],
 [7, 8, 5]]
```
Result: Lower sensitivity values indicating multiple near-optimal solutions.

### Unbalanced Options
When some assignments are much worse:
```
[[1, 2, 50],
 [2, 1, 50],
 [50, 50, 1]]
```
Result: High sensitivity for good assignments, very low for poor ones.

## Next Steps

- [Advanced Scenarios](/examples/advanced) - Complex multi-objective problems
- [Performance Tips](/examples/performance) - Optimizing for large matrices
- [Mathematical Theory](/theory/assignment-problem) - Understanding the algorithms