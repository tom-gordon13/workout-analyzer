import { COLORS } from '@/styles/color-theme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Line } from 'react-chartjs-2';

interface ChartTemplateProps {
    title: string;
    subtitle?: string;
    isSmallScreen: boolean;
    styles: any;
    data: any;
}

// Common chart options
const getChartOptions = (title: string, isSmallScreen: boolean, yAxisLabel?: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false, // We'll use custom legends
        },
        title: {
            display: false, // We'll use custom titles
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: COLORS.text,
            bodyColor: COLORS.text,
            borderColor: COLORS.grid,
            borderWidth: 1,
        },
    },
    scales: {
        x: {
            grid: {
                color: COLORS.grid,
                lineWidth: 1,
            },
            ticks: {
                color: COLORS.text,
                font: {
                    size: isSmallScreen ? 10 : 12,
                },
                callback: function (value: any, index: number) {
                    const label = this.getLabelForValue(value);
                    // Shorten labels on small screens
                    if (isSmallScreen && label.length > 3) {
                        return label.substring(0, 3);
                    }
                    return label;
                },
            },
        },
        y: {
            grid: {
                color: COLORS.grid,
                lineWidth: 1,
            },
            ticks: {
                color: COLORS.text,
                font: {
                    size: isSmallScreen ? 10 : 12,
                },
                callback: function (value: any) {
                    return yAxisLabel ? `${value}${yAxisLabel}` : value;
                },
            },
        },
    },
    layout: {
        padding: {
            left: isSmallScreen ? 10 : 20,
            right: isSmallScreen ? 10 : 20,
            top: 10,
            bottom: 10,
        },
    },
});

const ChartTemplate = ({ title, isSmallScreen, styles, data, subtitle }: ChartTemplateProps) => {

    const options = getChartOptions(title, isSmallScreen, '%');
    return (
        <ThemedView style={[styles.chartContainer, isSmallScreen && styles.chartContainerSmall]}>
            <ThemedText type="subtitle" style={[styles.chartTitle, isSmallScreen && styles.chartTitleSmall]}>
                {title}
            </ThemedText>
            <ThemedText style={[styles.chartSubtitle, isSmallScreen && styles.chartSubtitleSmall]}>
                {subtitle || ''}
            </ThemedText>

            <ThemedView style={[styles.chartWrapper, isSmallScreen && styles.chartWrapperSmall]}>
                <Line
                    data={data}
                    options={options}
                />
            </ThemedView>

            <ThemedView style={styles.legend}>
                <ThemedView style={styles.legendItem}>
                    <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(255, 59, 48, 1)' }]} />
                    <ThemedText style={styles.legendText}>Left Leg</ThemedText>
                </ThemedView>
                <ThemedView style={styles.legendItem}>
                    <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(0, 122, 255, 1)' }]} />
                    <ThemedText style={styles.legendText}>Right Leg</ThemedText>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    )
}

export default ChartTemplate;