# IA Server

A simple server with multiple objectifs

First get the action of a video,

In the Test folder we can :

- get a video from our AWS Database (S3 Bucket).
- get the sound from a text with Polly from AWS.

Our routes isn't really set yet, but we actually have :

- For IA :
  - NewProcess => (not set) : get the information to crate a new process with an unique ID to : 0.5 - get the video 1 - get the different action from a video 2 - set the action word to text 3 - set the text of action to a speech 4 - get the time stamp where the character is not talking in the video 5 - set the speech in the video where the time stamp are
  - GetStatus => (not set) : get the process status of a project
  - setStatus => (not set) : set the status of a project (like for the first IA the percentage of the process)
  - EndProcess => (not set) : to stop a process that is actually in progress
- For the Voice :
  - retrieveVoice => (set, but not in totality) : retrieve the speech from AWS Polly with the id of the voice and a text (need to know if i send the file or i register it on a database)
  - retreiveVoices => (set) retrieve the diferent voices with the id and the language in a json format.
