import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { ButtonGroup, Button } from 'react-bootstrap';

const UserChart: React.FC = () => {
    const [data, setData] = useState<{ period: string; count: number }[]>([]);
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/user-joins?period=${period}`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching user joins data:', error);
            }
        };

        fetchData();
    }, [period]);

    useEffect(() => {
        if (canvasRef.current) {
            // Destroy previous chart if it exists
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            // Create new chart
            chartRef.current = new Chart(canvasRef.current, {
                type: 'line',
                data: {
                    labels: data.map(item => item.period),
                    datasets: [
                        {
                            label: `Users Joined Per ${period.charAt(0).toUpperCase() + period.slice(1)}`,
                            data: data.map(item => item.count),
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const label = context.dataset.label || '';
                                    return `${label}: ${context.raw}`;
                                },
                            },
                        },
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                },
            });
        }

        // Cleanup on component unmount
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data, period]);

    return (
        <div>
            <canvas ref={canvasRef} />
            <ButtonGroup className="mt-5">
                <Button onClick={() => setPeriod('day')} active={period === 'day'}>Daily</Button>
                <Button onClick={() => setPeriod('week')} active={period === 'week'}>Weekly</Button>
                <Button onClick={() => setPeriod('month')} active={period === 'month'}>Monthly</Button>
            </ButtonGroup>  
        </div>
    );
};

export default UserChart;
