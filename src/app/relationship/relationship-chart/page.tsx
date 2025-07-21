'use client';

import React, { useEffect, useRef } from 'react';

interface RelationshipDataPoint {
    month: string;
    scale: number;
    notes: string;
}

interface ChartColors {
    backgroundColors: string[];
    pointColors: string[];
}

class RelationshipChart {
    private ctx: CanvasRenderingContext2D;
    private actualData: RelationshipDataPoint[];
    
    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            throw new Error(`Canvas with ID '${canvasId}' not found`);
        }
        this.ctx = canvas.getContext('2d')!;
        this.actualData = this.initializeData();
        this.render();
    }

    private initializeData(): RelationshipDataPoint[] {
        return [
            { month: 'Jan 2023', scale: 2, notes: '' },
            { month: 'Feb 2023', scale: 4, notes: 'Plat Finance - Trust built on the mountain' },
            { month: 'Mar 2023', scale: 5, notes: '' },
            { month: 'Apr 2023', scale: 6, notes: '' },
            { month: 'May 2023', scale: 7, notes: '' },
            { month: 'Jun 2023', scale: 6, notes: '' },
            { month: 'Jul 2023', scale: 3, notes: 'Plat Adventure - Insecurities became too much to handle' },
            { month: 'Aug 2023', scale: 6, notes: 'Brandon took it as a challenge and was committed to showing me how much he cared' },
            { month: 'Sep 2023', scale: 7, notes: '' },
            { month: 'Oct 2023', scale: 6, notes: 'Challenges at Plat Relationship' },
            { month: 'Nov 2023', scale: 7, notes: 'Ultimately I think relationship brought us closer' },
            { month: 'Dec 2023', scale: 6, notes: 'Pregnancy brought a lot of stress' },
            { month: 'Jan 2024', scale: 1, notes: 'Huge blowout finding out about Holly and Heather which Megan took as betrayal' },
            { month: 'Feb 2024', scale: 5, notes: 'Trauma brought us closer and restored trust' },
            { month: 'Mar 2024', scale: 6, notes: '' },
            { month: 'Apr 2024', scale: 7, notes: '' },
            { month: 'May 2024', scale: 8, notes: '' },
            { month: 'Jun 2024', scale: 9, notes: '' },
            { month: 'Jul 2024', scale: 9, notes: '' },
            { month: 'Aug 2024', scale: 6, notes: 'Brandon started making ultimatums' },
            { month: 'Sep 2024', scale: 7, notes: 'Brandon decided he didn\'t want to leave but committed to taking me "off the pedestal"' },
            { month: 'Oct 2024', scale: 6, notes: 'Megan could sense the emotional detachment which further exasperated the issues' },
            { month: 'Nov 2024', scale: 5, notes: '' },
            { month: 'Dec 2024', scale: 4, notes: '' },
            { month: 'Jan 2025', scale: 3, notes: '' },
            { month: 'Feb 2025', scale: 2, notes: '' },
            { month: 'Mar 2025', scale: 1, notes: 'Breakup - Brandon told Megan he didn\'t want to be in this relationship' },
            { month: 'Apr 2025', scale: 2, notes: 'After a month apart Megan convinced Brandon to not give-up and try to make the relationship work' },
            { month: 'May 2025', scale: 2, notes: 'Although there was a big part of Brandon that did want things to work out, the stacking resentment' }
        ];
    }

    private render(): void {
        const canvas = this.ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw axis
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(50, height - 50);
        this.ctx.lineTo(width - 50, height - 50);
        this.ctx.stroke();
        
        // Draw data points
        const maxScale = 10;
        const minScale = 0;
        const xStep = (width - 100) / (this.actualData.length - 1);
        const yRange = height - 100;
        
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        this.actualData.forEach((point, index) => {
            const x = 50 + index * xStep;
            const y = height - 50 - ((point.scale - minScale) / (maxScale - minScale)) * yRange;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            // Draw point
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.stroke();
    }
}

export default function RelationshipChartPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = 1200;
            canvasRef.current.height = 600;
            new RelationshipChart('relationship-chart-canvas');
        }
    }, []);
    
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Relationship Chart</h1>
            <div className="bg-white rounded-lg shadow-lg p-6">
                <canvas 
                    ref={canvasRef} 
                    id="relationship-chart-canvas"
                    className="w-full max-w-full"
                    style={{ maxHeight: '600px' }}
                />
            </div>
        </div>
    );
}