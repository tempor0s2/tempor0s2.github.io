// Score Tracker Application
let scoreTracker = null;

class ScoreTracker {
    constructor() {
        this.rows = [];
        this.rowCounter = 0;
        this.columnsPerRow = 8;
        this.initialScore = 0;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        console.log('Initializing Score Tracker...');
        
        // Get DOM elements
        this.gridRowsContainer = document.getElementById('grid-rows');
        this.addRowBtn = document.getElementById('add-row-btn');
        
        if (!this.gridRowsContainer) {
            console.error('grid-rows container not found');
            return;
        }
        
        if (!this.addRowBtn) {
            console.error('add-row-btn not found');
            return;
        }
        
        console.log('DOM elements found successfully');
        
        // Create initial row
        this.createRow(false);
        
        // Add event listener for add row button
        this.addRowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Add row button clicked');
            this.createRow(true); // Pass true to indicate copying names and scores
        });
        
        console.log('Score Tracker initialized successfully');
    }
    
    createRow(copyNamesAndScores = false) {
        console.log('Creating new row...', { copyNamesAndScores, existingRows: this.rows.length });
        
        const rowId = `row-${this.rowCounter++}`;
        const rowData = {
            id: rowId,
            columns: [],
            sum: 0
        };
        
        // Initialize column data
        for (let i = 0; i < this.columnsPerRow; i++) {
            let nameValue = '';
            let scoreValue = this.initialScore;
            
            // If copyNamesAndScores is true and we have existing rows, copy names and scores from the last row
            if (copyNamesAndScores && this.rows.length > 0) {
                const lastRow = this.rows[this.rows.length - 1];
                nameValue = this.getCurrentInputValue(lastRow.id, i) || lastRow.columns[i].name || '';
                scoreValue = lastRow.columns[i].score;
                console.log(`Copying name "${nameValue}" and score ${scoreValue} for column ${i}`);
            }
            
            rowData.columns.push({
                name: nameValue,
                score: scoreValue
            });
        }
        
        // Calculate initial sum
        rowData.sum = this.calculateRowSum(rowData);
        
        this.rows.push(rowData);
        this.renderRow(rowData);
        
        console.log(`Row ${rowId} created with ${this.columnsPerRow} columns and sum ${rowData.sum}`);
    }
    
    calculateRowSum(rowData) {
        return rowData.columns.reduce((sum, column) => sum + column.score, 0);
    }



    getCurrentInputValue(rowId, columnIndex) {
        const rowElement = document.getElementById(rowId);
        if (!rowElement) return '';
        
        const inputs = rowElement.querySelectorAll('.column-input');
        if (inputs[columnIndex]) {
            return inputs[columnIndex].value;
        }
        return '';
    }
    
    renderRow(rowData) {
        console.log('Rendering row:', rowData.id);
        
        const rowElement = document.createElement('div');
        rowElement.className = 'grid-row';
        rowElement.id = rowData.id;
        
        // Add animation class for new rows (except the first one)
        if (this.rows.length > 1) {
            rowElement.classList.add('new-row');
        }
        
        // Create grid columns container
        const gridColumns = document.createElement('div');
        gridColumns.className = 'grid-columns';
        
        // Create columns
        for (let columnIndex = 0; columnIndex < this.columnsPerRow; columnIndex++) {
            const columnElement = this.createColumn(rowData.id, columnIndex, rowData.columns[columnIndex]);
            gridColumns.appendChild(columnElement);
        }
        
        rowElement.appendChild(gridColumns);
        
        // Add row sum container
        const sumContainer = this.createRowSumContainer(rowData.id, rowData.sum);
        rowElement.appendChild(sumContainer);
        
        // Add copy button
        const copyContainer = this.createCopyContainer(rowData.id);
        rowElement.appendChild(copyContainer);
        
        // Add minus all button
        const minusAllContainer = this.createMinusAllContainer(rowData.id);
        rowElement.appendChild(minusAllContainer);
        
        // Add remove button for non-first rows
        if (this.rows.length > 1) {
            const removeContainer = document.createElement('div');
            removeContainer.className = 'remove-row-container';
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-row-btn';
            removeBtn.innerHTML = '✕';
            removeBtn.title = 'Remove this row';
            
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Remove button clicked for ${rowData.id}`);
                this.removeRow(rowData.id);
            });
            
            removeContainer.appendChild(removeBtn);
            rowElement.appendChild(removeContainer);
        }
        
        this.gridRowsContainer.appendChild(rowElement);
        
        // Remove animation class after animation completes
        if (this.rows.length > 1) {
            setTimeout(() => {
                if (rowElement.parentNode) {
                    rowElement.classList.remove('new-row');
                }
            }, 250);
        }
        
        console.log('Row rendered successfully:', rowData.id);
    }
    
    createRowSumContainer(rowId, initialSum) {
        const sumContainer = document.createElement('div');
        sumContainer.className = 'row-sum-container';
        
        // Create sum button
        const sumBtn = document.createElement('button');
        sumBtn.type = 'button';
        sumBtn.className = 'sum-btn';
        sumBtn.textContent = 'Sum';
        sumBtn.title = 'Calculate row total';
        
        sumBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Sum button clicked for ${rowId}`);
            this.updateRowSum(rowId, true);
        });
        
        // Create sum display
        const sumDisplay = document.createElement('div');
        sumDisplay.className = 'sum-display';
        sumDisplay.id = `sum-${rowId}`;
        sumDisplay.textContent = initialSum;
        
        sumContainer.appendChild(sumBtn);
        sumContainer.appendChild(sumDisplay);
        
        return sumContainer;
    }
    
    createCopyContainer(rowId) {
        const copyContainer = document.createElement('div');
        copyContainer.className = 'copy-container';
        
        // Create copy button
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy row data to clipboard';
        
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Copy button clicked for ${rowId}`);
            this.copyRowToClipboard(rowId);
            alert('Đã lưu vào bộ nhớ tạm'); 
        });
        
        copyContainer.appendChild(copyBtn);
        
        return copyContainer;
    }
    
    async copyRowToClipboard(rowId) {
        const row = this.rows.find(r => r.id === rowId);
        if (!row) {
            console.error('Row not found for copy operation');
            return;
        }
        
        // Build the formatted string
        const formattedData = row.columns
            .map((column, index) => {
                const name = this.getCurrentInputValue(rowId, index) || column.name || `Player ${index + 1}`;
                return `${name}: ${column.score}`;
            })
            .join(', ');
        
        try {
            await navigator.clipboard.writeText(formattedData);
            console.log('Row data copied to clipboard:', formattedData);
            
            // Show visual feedback
            this.showCopyFeedback(rowId);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            // Fallback for older browsers
            this.fallbackCopyToClipboard(formattedData);
        }
    }
    
    showCopyFeedback(rowId) {
        const copyBtn = document.querySelector(`#${rowId} .copy-btn`);
        if (copyBtn) {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✓';
            copyBtn.style.backgroundColor = 'var(--color-success)';
            copyBtn.style.color = 'var(--color-btn-primary-text)';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.backgroundColor = '';
                copyBtn.style.color = '';
            }, 1000);
        }
    }
    
    fallbackCopyToClipboard(text) {
        // Create a temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            console.log('Fallback copy successful');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
    }
    
    createMinusAllContainer(rowId) {
        const minusAllContainer = document.createElement('div');
        minusAllContainer.className = 'minus-all-container';
        
        // Create minus all button
        const minusAllBtn = document.createElement('button');
        minusAllBtn.type = 'button';
        minusAllBtn.className = 'minus-all-btn';
        minusAllBtn.innerHTML = '-1';
        minusAllBtn.title = 'Decrease all scores by 1';
        
        minusAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Minus all button clicked for ${rowId}`);
            this.decreaseAllScores(rowId);
        });
        
        minusAllContainer.appendChild(minusAllBtn);
        
        return minusAllContainer;
    }
    
    decreaseAllScores(rowId) {
        console.log(`Decreasing all scores by 1 for ${rowId}`);
        const row = this.rows.find(r => r.id === rowId);
        if (!row) {
            console.error('Row not found for decrease all operation');
            return;
        }
        
        // Decrease each column score by 1 (allow negative scores)
        for (let columnIndex = 0; columnIndex < row.columns.length; columnIndex++) {
            const oldScore = row.columns[columnIndex].score;
            const newScore = oldScore - 1; // Allow negative scores
            row.columns[columnIndex].score = newScore;
            
            // Update the display
            const scoreElement = document.getElementById(`score-${rowId}-${columnIndex}`);
            if (scoreElement) {
                scoreElement.textContent = newScore;
                
                // Add a subtle animation to show the change
                scoreElement.style.transform = 'scale(1.1)';
                scoreElement.style.transition = 'transform 150ms ease';
                
                setTimeout(() => {
                    scoreElement.style.transform = 'scale(1)';
                }, 150);
            }
            
            console.log(`Column ${columnIndex} score changed from ${oldScore} to ${newScore}`);
        }
        
        // Update the row sum
        this.updateRowSum(rowId, true);
        
        console.log('All scores decreased by 1 successfully');
    }
    
    createColumn(rowId, columnIndex, columnData) {
        const columnElement = document.createElement('div');
        columnElement.className = 'grid-column';
        
        // Create text input
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'form-control column-input';
        textInput.placeholder = `Player ${columnIndex + 1}`;
        textInput.value = columnData.name || '';
        
        // Ensure input is editable
        textInput.readOnly = false;
        textInput.disabled = false;
        textInput.setAttribute('autocomplete', 'off');
        textInput.setAttribute('spellcheck', 'false');
        
        // Add event listeners for input changes - using both input and change events
        textInput.addEventListener('input', (e) => {
            const newValue = e.target.value;
            console.log(`Input event - Updating column ${columnIndex} name to: "${newValue}"`);
            this.updateColumnName(rowId, columnIndex, newValue);
        });
        
        textInput.addEventListener('change', (e) => {
            const newValue = e.target.value;
            console.log(`Change event - Updating column ${columnIndex} name to: "${newValue}"`);
            this.updateColumnName(rowId, columnIndex, newValue);
        });
        
        // Create score display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'score-display';
        scoreDisplay.id = `score-${rowId}-${columnIndex}`;
        scoreDisplay.textContent = columnData.score;
        
        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'score-buttons';
        
        // Create increment button
        const incrementBtn = document.createElement('button');
        incrementBtn.type = 'button';
        incrementBtn.className = 'score-btn score-btn--up';
        incrementBtn.textContent = '+';
        incrementBtn.title = 'Increase score';
        
        // Use arrow function to preserve 'this' context and add proper event handling
        incrementBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Increment button clicked for ${rowId}-${columnIndex}`);
            this.updateScore(rowId, columnIndex, 1);
        });
        
        // Create decrement button
        const decrementBtn = document.createElement('button');
        decrementBtn.type = 'button';
        decrementBtn.className = 'score-btn score-btn--down';
        decrementBtn.textContent = '-';
        decrementBtn.title = 'Decrease score';
        
        // Use arrow function to preserve 'this' context and add proper event handling
        decrementBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Decrement button clicked for ${rowId}-${columnIndex}`);
            this.updateScore(rowId, columnIndex, -1);
        });
        
        buttonsContainer.appendChild(incrementBtn);
        buttonsContainer.appendChild(decrementBtn);
        
        // Create second row of buttons container
        const buttonsContainer2 = document.createElement('div');
        buttonsContainer2.className = 'score-buttons';
        
        // Create +4 button
        const plus4Btn = document.createElement('button');
        plus4Btn.type = 'button';
        plus4Btn.className = 'score-btn score-btn--up';
        plus4Btn.textContent = '+4';
        plus4Btn.title = 'Increase score by 4';
        
        plus4Btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`+4 button clicked for ${rowId}-${columnIndex}`);
            this.updateScore(rowId, columnIndex, 4);
        });
        
        // Create +2 button
        const plus2Btn = document.createElement('button');
        plus2Btn.type = 'button';
        plus2Btn.className = 'score-btn score-btn--up';
        plus2Btn.textContent = '+2';
        plus2Btn.title = 'Increase score by 2';
        
        plus2Btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`+2 button clicked for ${rowId}-${columnIndex}`);
            this.updateScore(rowId, columnIndex, 2);
        });
        
        buttonsContainer2.appendChild(plus4Btn);
        buttonsContainer2.appendChild(plus2Btn);
        
        // Assemble column
        columnElement.appendChild(textInput);
        columnElement.appendChild(scoreDisplay);
        columnElement.appendChild(buttonsContainer);
        columnElement.appendChild(buttonsContainer2);
        
        return columnElement;
    }
    
    removeRow(rowId) {
        console.log(`Removing row ${rowId}`);
        
        // Don't allow removing the first row
        if (rowId === this.rows[0]?.id) {
            console.log('Cannot remove the first row');
            return;
        }
        
        // Find the row element
        const rowElement = document.getElementById(rowId);
        if (!rowElement) {
            console.error('Row element not found');
            return;
        }
        
        // Add removing animation
        rowElement.classList.add('removing');
        
        // Remove from data structure and DOM after animation
        setTimeout(() => {
            // Remove from rows array
            this.rows = this.rows.filter(row => row.id !== rowId);
            
            // Remove from DOM
            if (rowElement.parentNode) {
                rowElement.remove();
            }
            
            console.log(`Row ${rowId} removed successfully`);
        }, 250);
    }
    
    updateColumnName(rowId, columnIndex, newName) {
        console.log(`Updating name for ${rowId}-${columnIndex}: "${newName}"`);
        const row = this.rows.find(r => r.id === rowId);
        if (row && row.columns[columnIndex]) {
            row.columns[columnIndex].name = newName;
            console.log('Name updated successfully in data');
        } else {
            console.error('Failed to find row or column for name update');
        }
    }
    
    updateScore(rowId, columnIndex, change) {
        console.log(`Updating score for ${rowId}-${columnIndex} by ${change}`);
        
        const row = this.rows.find(r => r.id === rowId);
        if (!row || row.columns[columnIndex] === undefined) {
            console.error('Failed to find row or column for score update');
            return;
        }
        
        const oldScore = row.columns[columnIndex].score;
        row.columns[columnIndex].score = oldScore + change // Prevent negative scores
        const newScore = row.columns[columnIndex].score;
        
        console.log(`Score changed from ${oldScore} to ${newScore}`);
        
        // Update the display
        const scoreElement = document.getElementById(`score-${rowId}-${columnIndex}`);
        if (scoreElement) {
            scoreElement.textContent = newScore;
            
            // Add a subtle animation to show the change
            scoreElement.style.transform = 'scale(1.1)';
            scoreElement.style.transition = 'transform 150ms ease';
            
            setTimeout(() => {
                scoreElement.style.transform = 'scale(1)';
            }, 150);
            
            console.log('Score display updated successfully');
            
            // Auto-update row sum when score changes
            this.updateRowSum(rowId, false); // false = don't animate since this is automatic
        } else {
            console.error('Score display element not found');
        }
    }
    
    updateRowSum(rowId, animate = true) {
        console.log(`Updating row sum for ${rowId}`);
        const row = this.rows.find(r => r.id === rowId);
        if (!row) {
            console.error('Row not found for sum update');
            return;
        }
        
        // Calculate new sum
        const newSum = this.calculateRowSum(row);
        const oldSum = row.sum;
        row.sum = newSum;
        
        console.log(`Row sum changed from ${oldSum} to ${newSum}`);
        
        // Update the display
        const sumElement = document.getElementById(`sum-${rowId}`);
        if (sumElement) {
            sumElement.textContent = newSum;
            
            if (animate) {
                // Add pulse animation to show the update
                sumElement.classList.add('updated');
                
                setTimeout(() => {
                    sumElement.classList.remove('updated');
                }, 250);
            }
            
            console.log('Sum display updated successfully');
        } else {
            console.error('Sum display element not found');
        }
    }
    
    getAllData() {
        return {
            rows: this.rows,
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize when script loads
console.log('Script loaded, creating Score Tracker...');
scoreTracker = new ScoreTracker();

// Global access for debugging
window.scoreTracker = scoreTracker;

// Helper functions
window.ScoreTrackerUtils = {
    debug: () => {
        console.log('Current data:', scoreTracker ? scoreTracker.getAllData() : 'Not initialized');
    },
    
    getRowSums: () => {
        if (!scoreTracker) return [];
        return scoreTracker.rows.map(row => ({
            id: row.id,
            sum: row.sum,
            columns: row.columns.map(col => col.score)
        }));
    },
    
    getTotalScores: () => {
        if (!scoreTracker) return [];
        
        const totals = [];
        for (let col = 0; col < scoreTracker.columnsPerRow; col++) {
            let total = 0;
            scoreTracker.rows.forEach(row => {
                total += row.columns[col].score;
            });
            totals.push(total);
        }
        return totals;
    },
    
    getRowCount: () => {
        return scoreTracker ? scoreTracker.rows.length : 0;
    },
    
    updateAllRowSums: () => {
        if (!scoreTracker) return;
        scoreTracker.rows.forEach(row => {
            scoreTracker.updateRowSum(row.id);
        });
    }
};