import styled from "styled-components";

export const StyledStats = styled.div`
    box-sizing: border-box;
    width: 100%;
    min-height: 100px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: var(--wt-post-gap, 14px);
    flex-shrink: 0;
    overflow-y: auto;
    padding: var(--wt-post-gap, 14px);
`;
