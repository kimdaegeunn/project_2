var data = {
    labels: ["청결", "경관", "편의시설", "접근성", "가격", '놀이시설', '캠핑장규모','예약용이성', '기타'],
    datasets: [{
        label: '캠핑장 선택기준',
        data: [27.7, 20.1, 15.2, 10.1, 6.8, 4.6, 3.6, 2.5, 9.4],
        backgroundColor: [
            'rgba(30,196,54,1)',
            'rgba(30,196,54,1)',
            'rgba(30,196,54,1)',
            'rgba(30,196,54,1)',
            'rgba(30,196,54,1)',
            'rgba(30,196,54,1)',
            'rgba(30,196,54,1)',
            'rgba(30,196,54,1)',
            'rgba(30,196,54,1)',

        ],
        // borderColor: [
        //     'rgba(255, 99, 132, 1)',
        //     'rgba(54, 162, 235, 1)',
        //     'rgba(255, 206, 86, 1)',
        //     'rgba(75, 192, 192, 1)',
        //     'rgba(153, 102, 255, 1)',
        //     'rgba(255, 159, 64, 1)'
        // ],
        borderWidth: 1
    }]
};

// 수직 바 차트 생성
var ctx = document.getElementById('verticalBarChart').getContext('2d');
var myVerticalBarChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        indexAxis: 'y', // y축을 기준으로 바 차트를 그립니다.
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});