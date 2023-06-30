afplay /System/Library/PrivateFrameworks/ScreenReader.framework/Versions/A/Resources/Sounds/PopupAppeared.aiff
param=$*
if [ $# -eq 0 ]
then
    echo no param
else
    say $param;
    # ${#param}
fi