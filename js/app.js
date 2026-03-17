/* Улучшенные подсказки для квадратиков */
.square {
    position: relative;
    cursor: help;
    transition: all 0.2s ease;
}

.square:hover {
    transform: scale(1.1);
    z-index: 10;
}

.square:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #232830;
    color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 1000;
    margin-bottom: 8px;
    border: 1px solid #ff3b3b;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    pointer-events: none;
    font-weight: normal;
    text-transform: none;
    letter-spacing: normal;
    line-height: 1.4;
}

.square:hover::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: #ff3b3b;
    margin-bottom: 2px;
    pointer-events: none;
    z-index: 1000;
}

/* Для мобильных устройств */
@media (max-width: 768px) {
    .square:hover::after {
        white-space: normal;
        max-width: 200px;
        text-align: center;
    }
}
