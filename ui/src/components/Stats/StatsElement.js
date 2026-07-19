import styled from "styled-components";

export const StatsElement = styled.div`
    height: 80px;
    text-transform: uppercase;
    color: var(--color-text, #fff);
    width: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: var(--space-4, 15px);
    margin-left: var(--space-4, 15px);

    .title {
        padding-top: var(--space-3, 10px);
        font-size: 0.8em;
        flex: 1;
    }
`;
