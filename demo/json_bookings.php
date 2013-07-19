<?php

$year = date('y'); // Year passed from the plugin (es: 2000)
$month = date('m'); // Month passed from the plugin (es: 1)

echo json_encode(array(
    array(
        'label' => 'First Floor',
        'items' => array(
            array(
                'label' => 'Meeting room 1',
                'bookings' => array(
                    array(
                        'id' => 'booking_1',
                        'label' => '#1',
                        'start' => '2013-01-08',
                        'end' => '2013-01-10',
                        'textColor' => '#ffffff',
                        'background' => '#ff0000',
                        'tooltip' => 'Reservation #1<br/> by <i>John Doe</i>',
                    ),
                    array(
                        'id' => 'booking_2',
                        'label' => '#2',
                        'start' => '2013-01-12',
                        'end' => '2013-01-16',
                        'textColor' => '#ffffff',
                        'background' => '#58b000',
                        'tooltip' => 'Reservation #2<br/> by <i>John Doe</i>',
                    ),
                    array(
                        'id' => 'booking_3',
                        'label' => '#3',
                        'start' => '2013-01-20',
                        'end' => '2013-01-22',
                        'textColor' => '#ffffff',
                        'background' => '#58b000',
                        'tooltip' => 'Reservation #3<br/> by <i>John Doe</i>',
                    )
                )
            ),
            array(
                'label' => 'Meeting room 2',
                'bookings' => array(
                    array(
                        'id' => 'booking_4',
                        'label' => '#4',
                        'start' => '2013-01-14',
                        'end' => '2013-01-20',
                        'textColor' => '#ffffff',
                        'background' => '#58b000'
                    )
                )
            ),
            array(
                'label' => 'Meeting room 3',
                'bookings' => array(
                    array(
                        'id' => 'booking_5',
                        'label' => '#5',
                        'start' => '2013-01-30',
                        'end' => '2013-02-02',
                        'textColor' => '#ffffff',
                        'background' => '#58b000'
                    )
                )
            )
        )
    )

));
