document.addEventListener('DOMContentLoaded', function () {
    bookedDates = bookedDates.map(function (event) {
        // Adjust the end date by subtracting one day
        var endDateAdjusted = new Date(event.end);
        endDateAdjusted.setDate(endDateAdjusted.getDate() - 1);

        return {
            title: 'Booked', // Display 'Booked' on the calendar
            start: new Date(event.start),
            end: endDateAdjusted // Use the adjusted end date
        };
    });

    console.log(bookedDates)

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true, // Enable day selection
        eventTimeFormat: {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        },
        displayEventTime: false,
        select: function (info) {
            console.log('Selected start date:', info.startStr);
            console.log('Selected end date:', info.endStr);
            handleDateSelection(info); // Call handleDateSelection function when a date is selected
        },
        events: bookedDates
    });
    calendar.render();

    function handleDateSelection(info) {
        var selectedStartDate = new Date(info.startStr);
        var selectedEndDate = new Date(info.endStr);
        var isBooked = bookedDates.some(function (event) {
            var eventStartDate = new Date(event.start);
            var eventEndDate = new Date(event.end);
            return (
                selectedStartDate >= eventStartDate &&
                selectedEndDate <= eventEndDate
            );
        });
        if (isBooked) {
            alert('This date range is already booked.');
        } else {
            document.getElementById('startDate').value = info.startStr;
            document.getElementById('endDate').value = info.endStr;
        }
    }
});