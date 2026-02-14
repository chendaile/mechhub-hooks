import { useDetailPanelState } from "../states/useDetailPanelState";
import { useImagePanZoomState } from "../states/useImagePanZoomState";
import { useStepSelectionState } from "../states/useStepSelectionState";

export const useImageGradingPanelState = () => {
    const detailPanelState = useDetailPanelState();
    const stepSelectionState = useStepSelectionState();
    const imagePanZoomState = useImagePanZoomState();

    return {
        state: {
            showDetail: detailPanelState.state.isDetailOpen,
            isSidebarOpen: detailPanelState.state.isSidebarOpen,
            activeStepIndex: stepSelectionState.state.activeStepIndex,
            stepRefs: stepSelectionState.state.stepRefs,
            stepListContainerRef: stepSelectionState.state.stepListContainerRef,
            scale: imagePanZoomState.state.scale,
            position: imagePanZoomState.state.position,
            isDragging: imagePanZoomState.state.isDragging,
        },
        actions: {
            openDetail: detailPanelState.actions.openDetail,
            closeDetail: detailPanelState.actions.closeDetail,
            toggleSidebar: detailPanelState.actions.toggleSidebar,
            handleSelectStep: stepSelectionState.actions.handleSelectStep,
            handleZoomIn: imagePanZoomState.actions.handleZoomIn,
            handleZoomOut: imagePanZoomState.actions.handleZoomOut,
            handleReset: imagePanZoomState.actions.handleReset,
            handleMouseDown: imagePanZoomState.actions.handleMouseDown,
            handleMouseMove: imagePanZoomState.actions.handleMouseMove,
            handleMouseUp: imagePanZoomState.actions.handleMouseUp,
        },
        showDetail: detailPanelState.state.isDetailOpen,
        openDetail: detailPanelState.actions.openDetail,
        closeDetail: detailPanelState.actions.closeDetail,
        isSidebarOpen: detailPanelState.state.isSidebarOpen,
        toggleSidebar: detailPanelState.actions.toggleSidebar,
        activeStepIndex: stepSelectionState.state.activeStepIndex,
        handleSelectStep: stepSelectionState.actions.handleSelectStep,
        stepRefs: stepSelectionState.state.stepRefs,
        stepListContainerRef: stepSelectionState.state.stepListContainerRef,
        scale: imagePanZoomState.state.scale,
        position: imagePanZoomState.state.position,
        isDragging: imagePanZoomState.state.isDragging,
        handleZoomIn: imagePanZoomState.actions.handleZoomIn,
        handleZoomOut: imagePanZoomState.actions.handleZoomOut,
        handleReset: imagePanZoomState.actions.handleReset,
        handleMouseDown: imagePanZoomState.actions.handleMouseDown,
        handleMouseMove: imagePanZoomState.actions.handleMouseMove,
        handleMouseUp: imagePanZoomState.actions.handleMouseUp,
    };
};
