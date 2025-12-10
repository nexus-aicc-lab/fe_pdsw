/**
 * Scrolls to and highlights a specific node in the tree
 * @param nodeId The ID of the node to scroll to
 */
export const scrollToNode = (nodeId: string): void => {
    // Small delay to ensure DOM is updated with expanded nodes
    setTimeout(() => {
      // Find the node element by its data attribute
      const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
      
      if (nodeElement) {
        // Scroll the node into view
        nodeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // Add a temporary highlight effect
        nodeElement.classList.add('highlight-found-node');
        
        // Remove the highlight after 2 seconds
        setTimeout(() => {
          nodeElement.classList.remove('highlight-found-node');
        }, 2000);
      }
    }, 50);
  };