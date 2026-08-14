import QtQuick
import QtQuick.Layouts
import org.kde.plasma.plasmoid
import org.kde.plasma.private.pager 2.0

PlasmoidItem {
    id: root
    preferredRepresentation: fullRepresentation

    PagerModel {
        id: pagerModel
        enabled: root.visible
        pagerType: PagerModel.VirtualDesktops
    }

    fullRepresentation: Item {
        Layout.preferredWidth: row.implicitWidth + 8
        Layout.minimumWidth: Layout.preferredWidth

        RowLayout {
            id: row
            property bool expanded: false
            anchors.centerIn: parent
            spacing: 2

            Repeater {
                id: rep
                model: pagerModel
                delegate: Rectangle {
                    property bool current: index === pagerModel.currentPage
                    property bool occupied: winRep.count > 0
                    visible: current || occupied || row.expanded
                    width: 24
                    height: 24
                    radius: 4
                    color: current ? "#283c66" : (mouse.containsMouse ? "#1f2335" : "transparent")

                    Repeater {
                        id: winRep
                        model: TasksModel
                        delegate: Item { visible: false }
                    }

                    Text {
                        anchors.centerIn: parent
                        text: index + 1
                        color: current ? "#c0caf5" : (occupied ? "#565f89" : "#3b4261")
                        font.bold: current
                        font.pixelSize: 13
                    }

                    MouseArea {
                        id: mouse
                        anchors.fill: parent
                        hoverEnabled: true
                        onClicked: {
                            pagerModel.changePage(index)
                            row.expanded = false
                        }
                    }
                }
            }

            Rectangle {
                width: 24
                height: 24
                radius: 4
                color: plusMouse.containsMouse ? "#1f2335" : "transparent"

                Text {
                    anchors.centerIn: parent
                    text: row.expanded ? "\u00d7" : "+"
                    color: "#565f89"
                    font.pixelSize: 13
                }

                MouseArea {
                    id: plusMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    onClicked: row.expanded = !row.expanded
                }
            }
        }
    }
}
