import face_recognition
import cv2
import numpy as np
import sys
import json
import uuid
from os.path import exists

class Args:
    video_path = ''
    image_path = []
    def readingArgs(self):
        it = 0

        for it in range(len(sys.argv)):
            argument = sys.argv[it]
            if (argument == '-VP' or argument == '--VideoPath'):
                if (len(sys.argv) > it + 1):
                    if (exists(sys.argv[it + 1])):
                        self.video_path = sys.argv[it + 1]
                    else:
                        print("Error videoPath : file does not exist at the path given in parameters")
                        exit(84)
                it += 1
            elif (argument == "-IP" or argument == '--ImagePath'):
                if (len(sys.argv) > it + 1):
                    if (exists(sys.argv[it + 1])):
                        _image_path = sys.argv[it + 1]
                        imageName = _image_path.split('/')
                        if (len(imageName) == 1):
                            imageName = _image_path.split('\\')
                        imageName = imageName[len(imageName) - 1]
                        imageName = imageName.split('.')[0]

                        ln = len(self.image_path)
                        self.image_path.append([])
                        self.image_path[ln].append(imageName)
                        self.image_path[ln].append(_image_path)
                    else:
                        print("Error ImagePath : file does not exist at the path given in parameters")
                        exit(84)
                it += 1
        return (0)
    
    def printFiles(self):
        print("Video Path :", self.video_path)
        print("Image :")
        for image in self.image_path:
            if (len(image) == 2):
                print("Name:", image[0], "Path :", image[1])
        return (0)

def faceRecogniton(args):
    json_File_Name = str(uuid.uuid1()) + ".json"
    cap = cv2.VideoCapture(args.video_path)

    if not cap.isOpened():
        print("Error opening video file")
        exit (84)
    width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    fps = cap.get(cv2.CAP_PROP_FPS)
    print("Video properties:")
    print("Video Dimension", width, height)
    print("Video FPS:", fps)
    # print("Video Lenght:", cap.get(cv2.CAP_PROPS_SIZE))

# Load the pictures and learn how to recognize it.
    images = []
    known_face_encodings = []
    known_face_names = []
    for _images in args.image_path:
        ln = len(images)
        if (len(_images) == 2):
            images.append(face_recognition.load_image_file(_images[1]))
            known_face_encodings.append(face_recognition.face_encodings(images[ln])[0])
            known_face_names.append(_images[0])

# Initialize some variables
    face_locations = []
    face_encodings = []
    face_names = []

    process_this_frame = True
    it_frame = 0
    while(cap.isOpened()):
        ret, frame = cap.read()
        if (ret and process_this_frame):

            json_object = json.dumps({str(it_frame): []}, indent=it_frame)

            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

            rgb_small_frame = small_frame[:, :, ::-1]
            
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

            face_names = []
            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                name = "Unknown"

                face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_face_names[best_match_index]

                face_names.append(name)
            
            for (top, right, bottom, left), name in zip(face_locations, face_names):
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4
                # Draw a box around the face
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

                # Draw a label with a name below the face
                cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
                font = cv2.FONT_HERSHEY_DUPLEX
                cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
        else:
            break

        cv2.imshow("Video", frame)
        cv2.waitKey(1)
        it_frame += 1
    cap.release()

def main():
    args = Args()
    args.readingArgs()
    # args.printFiles()
    faceRecogniton(args)
    return (0)

main()